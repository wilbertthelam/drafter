const _ = require('lodash');
const debug = require('debug')('drafter');
const db = require('mssql');
const poolConfig = require('./utils/db');

class DraftInstance {
  constructor(
    players,
    users,
    draftOrder,
    draftHistory,
    allUsersRoster,
    draftId,
    keepers,
  ) {
    this.players = players || [];
    this.users = users || [];
    this.draftOrder = draftOrder || [];
    this.draftHistory = draftHistory || [];
    this.allUsersRoster = allUsersRoster;
    this.currentPickIndex = 0;
    this.previousPickPlayerId = undefined;
    this.previousPickUserId = undefined;
    this.currentPickUserId = undefined;
    this.futurePicks = this.createFuturePicks(0);
    this.draftPaused = false;
    this.draftId = draftId;

    this.addKeepers(keepers);
  }

  addKeepers(keepers) {
    keepers.forEach((keeper) => {
      // Update players by marking them as Drafted
      this.markPlayerAsDrafted(keeper.playerId);

      // Add player to the users roster
      this.addPlayerToUserRoster(keeper.playerId, keeper.userId, true);

      // Update draftOrder by marking as a keeper usage
      // at that round and pick
      keeper.sacrificedPicks.forEach((sacrificedPick) => {
        const pick = _.find(this.draftOrder, (draftPick) => {
          return draftPick.round === sacrificedPick.round &&
            draftPick.pickNumber === sacrificedPick.pickNumber;
        });

        if (!pick) {
          debug('Could not find requested sacrificed pick for keepers');
        } else {
          pick.isKeeper = true;
          pick.playerId = keeper.playerId;
        }
      });
    });
  }

  currentPickIsKeeper() {
    if (this.currentPickIndex >= this.draftOrder.length) {
      return false;
    }

    // If not a keeper, return false
    const draftPick = this.draftOrder[this.currentPickIndex];
    if (!draftPick.isKeeper || draftPick.isKeeper === false) {
      return false;
    }

    return true;
  }

  draftKeeper() {
    const draftPick = this.draftOrder[this.currentPickIndex];
    this.updatePrevious(draftPick.playerId, draftPick.userId);
    this.addPlayerToDraftHistory(draftPick.playerId, draftPick.userId);
    this.advanceToNextPick();
    this.updateFuturePicks(this.currentPickIndex);
    return this.createPickEvent();
  }

  pauseDraft() {
    this.draftPaused = true;
  }

  resumeDraft() {
    this.draftPaused = false;
  }

  createPickEvent() {
    return {
      previousPickUserId: this.previousPickUserId,
      previousPickPlayerId: this.previousPickPlayerId,
      currentPickUserId: this.currentPickUserId,
      futurePicks: this.getFuturePicks(),
      previousPickRound: this.getPreviousPickRound(),
      previousPickPickNumber: this.getPreviousPickNumber(),
      draftComplete: this.currentPickIndex >= this.draftOrder.length,
      userRoster: this.allUsersRoster[this.previousPickUserId],
    };
  }

  advanceToNextPick() {
    this.currentPickIndex += 1;
    this.currentPickUserId = this.getCurrentUserPick();
  }

  updatePrevious(playerId, userId) {
    this.previousPickPlayerId = playerId;
    this.previousPickUserId = userId;
  }

  updateFuturePicks(currentPickIndex) {
    this.futurePicks = this.createFuturePicks(currentPickIndex);
  }

  draftPlayer(playerId, userId) {
    if (this.draftPaused === true) {
      debug('Drafted paused right now, cannot draft.');
      return 'FAIL_DRAFT_PAUSED';
    }

    // Check to make sure it is current user's turn
    if (userId !== this.getCurrentUserPick()) {
      return 'FAIL_NOT_USER_TURN';
    }

    this.updatePrevious(playerId, userId);
    this.addPlayerToDraftHistory(playerId, userId);
    this.addPlayerToUserRoster(playerId, userId);
    this.markPlayerAsDrafted(playerId);
    this.advanceToNextPick();
    this.updateFuturePicks(this.currentPickIndex);
    return this.createPickEvent();
  }

  addPlayerToUserRoster(playerId, userId, isKeeper) {
    const rosterPlayer = {
      playerId,
      userId,
      round: this.getCurrentRound(),
      pickNumber: this.getCurrentPickNumber(),
      isKeeper,
    };

    if (this.getUserRoster(userId)) {
      this.getUserRoster(userId).push(rosterPlayer);
    }
  }

  findPlayer(playerId) {
    return _.find(this.players, (player) => {
      return player.id === playerId;
    });
  }

  markPlayerAsDrafted(playerId) {
    const playerToMark = this.findPlayer(playerId);
    playerToMark.isDrafted = true;
  }

  markPlayerAsNotDrafted(playerId) {
    const playerToMark = this.findPlayer(playerId);
    playerToMark.isDrafted = false;
  }

  storeDraftHistoryInDB(draftHistoryModel) {
    const dbModel = {
      playerId: draftHistoryModel.previousPickPlayerId,
      userId: draftHistoryModel.previousPickUserId,
      pickRound: draftHistoryModel.previousPickRound,
      pickNumber: draftHistoryModel.previousPickPickNumber,
      draftId: this.draftId,
      isDrafted: 1,
    };

    new db.ConnectionPool(poolConfig).connect().then((connection) => {
      return connection.query`
        INSERT INTO draft_results (playerId, userId, pickRound, pickNumber, draftId, isDrafted)
        VALUES (${dbModel.playerId}, ${dbModel.userId},
          ${dbModel.pickRound}, ${dbModel.pickNumber},
          ${dbModel.draftId}, ${dbModel.isDrafted});
      `;
    }).then((response) => {
      debug(`Player inserted into DB: ${JSON.stringify(response)}`);
    }).catch((error) => {
      debug(`Failed to insert player into DB: ${JSON.stringify(error)}`);
    });
  }

  addPlayerToDraftHistory(playerId, userId) {
    const draftHistoryModel = {
      previousPickPlayerId: playerId,
      previousPickUserId: userId,
      previousPickRound: this.getCurrentRound(),
      previousPickPickNumber: this.getCurrentPickNumber(),
    };

    this.draftHistory.push(draftHistoryModel);
    this.storeDraftHistoryInDB(draftHistoryModel);
  }

  createFuturePicks(pickIndex) {
    return this.draftOrder.slice(
      pickIndex,
      pickIndex + 10,
    );
  }

  rollbackPick() {
    return new Promise((resolve, reject) => {
      if (this.currentPickIndex > 0) {
        debug(`Old draft order: ${JSON.stringify(this.createFuturePicks(this.currentPickIndex))}`);
        this.currentPickIndex -= 1;

        // Find if the current pick is a keeper pick, if so do not remove
        // from players list or from the user's roster
        const previousKeeper = this.draftOrder[this.currentPickIndex];

        // Rollback draft history by cutting off the first player (most recent)
        const previousPlayer = this.draftHistory.pop();

        debug(`Current pick index: ${this.currentPickIndex}`);
        // Rollback future picks by reinitializing with new currentPickIndex
        this.updateFuturePicks(this.currentPickIndex);
        debug(`New draft order: ${JSON.stringify(this.futurePicks)}`);

        // Rollback user rosters by removing player from user roster
        if (!previousKeeper.isKeeper || previousKeeper.isKeeper === false) {
          const newUserRoster = this.allUsersRoster[this.previousPickUserId];
          _.remove(newUserRoster, (player) => {
            return player.playerId === previousPlayer.previousPickPlayerId &&
              (!player.isKeeper || player.isKeeper === false);
          });
          this.allUsersRoster[this.previousPickUserId] = newUserRoster;
        }

        // Rollback current pick userId
        debug(`New current pick index: ${this.currentPickIndex}`);
        this.currentPickUserId = this.previousPickUserId;

        // Rollback picked player
        if (!previousKeeper.isKeeper || previousKeeper.isKeeper === false) {
          this.markPlayerAsNotDrafted(previousPlayer.previousPickPlayerId);
        }

        // Clean out previousPickPlayerId and previousPickUserId
        this.previousPickPlayerId = undefined;
        this.previousPickUserId = this.currentPickIndex > 0 ?
          this.draftOrder[this.currentPickIndex - 1].userId :
          undefined;

        return resolve();
      }
      return reject(new Error('Current pick is already the start.'));
    });
  }

  updateUserStatus(userId, status) {
    const user = this.users[userId];
    if (user) {
      user.online = status;
    }
  }

  getNextPickNumber(userId) {
    for (let i = this.currentPickIndex; i < this.draftOrder.length; i += 1) {
      if (this.draftOrder[i].userId === userId) {
        return this.draftOrder[i].pickNumber;
      }
    }
    return -1;
  }

  getDraftHistory() {
    return this.draftHistory;
  }

  getCurrentUserPick() {
    return this.draftOrder[this.currentPickIndex] &&
      this.draftOrder[this.currentPickIndex].userId;
  }

  getCurrentRound() {
    return this.draftOrder[this.currentPickIndex] &&
      this.draftOrder[this.currentPickIndex].round;
  }

  getCurrentPickNumber() {
    return this.draftOrder[this.currentPickIndex] &&
      this.draftOrder[this.currentPickIndex].pickNumber;
  }

  getPreviousPickRound() {
    return this.draftOrder[this.currentPickIndex - 1] &&
      this.draftOrder[this.currentPickIndex - 1].round;
  }

  getPreviousPickNumber() {
    return this.draftOrder[this.currentPickIndex - 1] &&
      this.draftOrder[this.currentPickIndex - 1].pickNumber;
  }

  getPreviousPickUserId() {
    return this.previousPickUserId;
  }

  getUserRoster(userId) {
    return this.allUsersRoster[userId];
  }

  getFuturePicks() {
    return this.futurePicks;
  }

  // Expensive call, only return on initial load since it returns all players
  getPlayers() {
    return this.players;
  }

  getUsers() {
    return this.users;
  }

  getCurrentPickIndex() {
    return this.currentPickIndex;
  }

  getIsPaused() {
    return this.draftPaused;
  }
}

module.exports = DraftInstance;
