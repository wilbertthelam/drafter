/**
 * This is a single instance of a draft.
 * All actions pertaining to a specific draft are processed here.
 * Globals pertaining to a specific draft are contained here.
 */

const _ = require('lodash');
const debug = require('debug')('drafter');
const db = require('mssql');
const poolConfig = require('./utils/db');
const sport = require('./utils/currentSport');

class DraftInstance {
  constructor(
    players, // List of all players eligible in the draft (regardless of drafted status)
    users, // List of users who can draft inside this instance
    draftOrder, // List containing the full draft picks, in order, for all users
    draftHistory, // List containing the drafted players
    allUsersRoster, // Map of rosters for each user (user => [...player])
    draftId, // Unique draft identification
    keepers, // List of keepers
    currentPickIndex, // Current pick index of the draft
  ) {
    this.players = players || [];
    this.users = users || [];
    this.draftOrder = draftOrder || [];
    this.draftHistory = draftHistory || [];
    this.allUsersRoster = allUsersRoster;
    this.currentPickIndex = currentPickIndex || 0;
    this.draftId = draftId;

    this.previousPickPlayerId = undefined;
    this.previousPickUserId = undefined;
    this.currentPickUserId = undefined;
    this.futurePicks = this.createFuturePicks(0); // Creates ticker picks
    this.draftPaused = false;

    // Populate draft instance with keepers
    this.addKeepers(keepers);

    // Populate draft history (useful for re-initialization)
    this.markDraftedPlayersInHistoryAsDrafted(draftHistory);
  }

  markDraftedPlayersInHistoryAsDrafted(draftHistory) {
    draftHistory.forEach((player) => {
      this.markPlayerAsDrafted(player.previousPickPlayerId);
    });
  }

  addKeepers(keepers) {
    keepers.forEach((keeper) => {
      // Update players by marking them as drafted
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
    // If pick is outside range of possible picks, return false
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
    this.addPlayerToDraftHistory(draftPick.playerId, draftPick.userId, true);
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
      isKeeper: this.draftHistory[this.draftHistory.length - 1].isKeeper,
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
    if (this.isDraftPaused()) {
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
    if (playerToMark) {
      playerToMark.isDrafted = true;
    } else {
      debug(`Failed to find playerId: ${playerId} in the list of players when attempting to mark as drafted`);
    }
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
      if (sport === "baseball") {
        return connection.query`
          INSERT INTO draft_results (playerId, userId, pickRound, pickNumber, draftId, isDrafted)
          VALUES (${dbModel.playerId}, ${dbModel.userId},
            ${dbModel.pickRound}, ${dbModel.pickNumber},
            ${dbModel.draftId}, ${dbModel.isDrafted});`;
      } else if (sport === "basketball") {
        return connection.query`
        INSERT INTO basketball_draft_results (playerId, userId, pickRound, pickNumber, draftId, isDrafted)
        VALUES (${dbModel.playerId}, ${dbModel.userId},
          ${dbModel.pickRound}, ${dbModel.pickNumber},
          ${dbModel.draftId}, ${dbModel.isDrafted});`;
      }
      return undefined;
    }).then((response) => {
      debug(`Player inserted into DB: ${JSON.stringify(response)}`);
    }).catch((error) => {
      debug(`Failed to insert player into DB: ${JSON.stringify(error)}`);
    });
  }

  addPlayerToDraftHistory(playerId, userId, isKeeper) {
    const draftHistoryModel = {
      previousPickPlayerId: playerId,
      previousPickUserId: userId,
      previousPickRound: this.getCurrentRound(),
      previousPickPickNumber: this.getCurrentPickNumber(),
      isKeeper,
    };

    this.draftHistory.push(draftHistoryModel);
    this.storeDraftHistoryInDB(draftHistoryModel);
  }

  createFuturePicks(pickIndex) {
    return this.draftOrder.slice(
      pickIndex,
      pickIndex + 10, // TODO: specify # of future picks
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

        new db.ConnectionPool(poolConfig).connect().then((connection) => {
          if (sport === "baseball") {
            return connection.query`
              UPDATE draft_results
              SET isDrafted = 0
              WHERE userId = ${this.currentPickUserId}
              AND playerId = ${previousPlayer.previousPickPlayerId}
              AND draftId = ${this.draftId};`;
          } else if (sport === "basketball") {
            return connection.query`
              UPDATE basketball_draft_results
              SET isDrafted = 0
              WHERE userId = ${this.currentPickUserId}
              AND playerId = ${previousPlayer.previousPickPlayerId}
              AND draftId = ${this.draftId};`;
          }
          
        }).then((response) => {
          debug(`Database marked player as not drafted and rolled back: ${JSON.stringify(response)}`);
        }).catch((error) => {
          debug(`Failed to rollback player into DB: ${JSON.stringify(error)}`);
        });

        // Clean out previousPickPlayerId and previousPickUserId
        this.previousPickPlayerId = undefined;
        this.previousPickUserId = this.currentPickIndex > 0 ?
          this.draftOrder[this.currentPickIndex - 1].userId :
          undefined;

        return resolve();
      }
      return reject(new Error('Current pick is already at the start.'));
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
      if (this.draftOrder[i].userId === userId && !this.draftOrder[i].isKeeper) {
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

  isDraftPaused() {
    return this.draftPaused;
  }
}

module.exports = DraftInstance;
