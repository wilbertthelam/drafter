const express = require('express');
const debug = require('debug')('drafter');
const DraftInstance = require('./draftInstance');
const apiHelper = require('./apiHelper');
const mockData = require('./utils/fieldOfGGreams');

const router = express.Router();

let draftInstance;

const loadPlayers = new Promise((resolve, reject) => {
  return apiHelper.getPlayers().then((data) => {
    const rawPlayers = data;
    const players = [];
    rawPlayers.forEach((player) => {
      const newPlayer = {
        isDrafted: false,
      };
      players.push(Object.assign({}, player, newPlayer));
    });
    return resolve(players);
  }).catch((error) => {
    return reject(new Error(`Error retrieving players: ${error}`));
  });
});

const loadUsers = new Promise((resolve, reject) => {
  return apiHelper.getUsers(mockData.draftId).then((data) => {
    const users = data;
    // Add default status field
    const expandedUsers = [];
    users.forEach((user) => {
      const expandedUser = user;
      expandedUser.online = false;
      expandedUsers.push(expandedUser);
    });
    return resolve(expandedUsers);
  }).catch((error) => {
    return reject(new Error(`Error retrieving users: ${error}`));
  });
});

const loadDraftHistory = new Promise((resolve, reject) => {
  return apiHelper.getDraftHistory(mockData.draftId).then((draftHistory) => {
    const draftHistoryWrapper = [];
    draftHistory.forEach((draftSlot) => {
      const wrappedDraftSlot = {
        previousPickPlayerId: draftSlot.playerId,
        previousPickUserId: draftSlot.userId,
        previousPickRound: draftSlot.pickRound,
        previousPickPickNumber: draftSlot.pickNumber,
        isKeeper: draftSlot.isKeeper,
      };
      draftHistoryWrapper.push(wrappedDraftSlot);
    });
    return resolve(draftHistoryWrapper);
  }).catch((error) => {
    return reject(new Error(`Error retrieving draft history: ${error}`));
  });
});

const loadCurrentPickIndex = new Promise((resolve, reject) => {
  return apiHelper.getCurrentPickIndex(mockData.draftId).then((currentPickIndex) => {
    if (!currentPickIndex || currentPickIndex.length === 0) {
      return resolve(0);
    }
    return resolve(currentPickIndex[0].max_number);
  }).catch((error) => {
    return reject(new Error(`Error retrieving draft history: ${error}`));
  });
});

const loadDraftUserRoster = new Promise((resolve, reject) => {
  return apiHelper.getDraftUserRoster(mockData.draftId).then((data) => {
    const draftUserRoster = {};
    apiHelper.getUsers(mockData.draftId).then((users) => {
      users.forEach((user) => {
        draftUserRoster[user.id] = [];
      });

      data.forEach((row) => {
        // If dictionary hasn't been initialized for the player, create it
        if (!draftUserRoster[row.userId]) {
          draftUserRoster[row.userId] = [];
        }

        const userRosterWrapper = {
          playerId: row.playerId,
          userId: row.userId,
          round: row.pickRound,
          pickNumber: row.pickNumber,
          isKeeper: 0, // TODO: make this actual read to see if it is keeper
        };

        draftUserRoster[row.userId].push(userRosterWrapper);
      });
      return resolve(draftUserRoster);
    });
  }).catch((error) => {
    return reject(new Error(`Error retrieving draft history: ${error}`));
  });
});

Promise.all([
  loadPlayers,
  loadUsers,
  loadDraftHistory,
  loadCurrentPickIndex,
  loadDraftUserRoster,
]).then((values) => {
  const players = values[0];
  const users = values[1];
  const draftHistory = values[2];
  const currentPickIndex = values[3];
  const draftUserRoster = values[4];

  draftInstance = new DraftInstance(
    players,
    users,
    mockData.draftOrder,
    draftHistory,
    draftUserRoster,
    mockData.draftId,
    mockData.draftKeepers,
    currentPickIndex,
  );
}).catch((error) => {
  debug(`Failed to intialize server data: ${error}`);
});

// Connections
module.exports = (io) => {
  io.on('connection', (socket) => {
    if (!(socket.request && socket.request.session && socket.request.session.userId)) {
      debug('Error with establishing user connection');
      socket.emit('force_refresh');
      return;
    }
    const userId = socket.request.session.userId;
    const isAdmin = socket.request.session.isAdmin;

    debug(`isAdmin: ${isAdmin}`);

    socket.emit('connection_verified', { userId, isAdmin });
    io.emit('user_status', { userId, online: true });

    // On first load data hydration
    // Send out required initial preload data first
    // that the rest of the data (history/ticker etc.)
    // have dependencies on.
    // If server resets, retry on existing client connections
    // until new data is retrieved.
    let numOfAttempts = 0;
    const sendDraftOrchestration = () => {
      const orchestrationData = {
        players: draftInstance.getPlayers(),
        users: draftInstance.getUsers(),
      };
      socket.emit('draft_orchestration_preload', orchestrationData);
    };

    const draftOrchestrationAttempt = () => {
      if (numOfAttempts < 60) {
        setTimeout(() => {
          if (draftInstance) {
            debug('sent data');
            // sendDraftOrchestration();
          } else {
            numOfAttempts += 1;
            debug(`Num of retry attempts: ${numOfAttempts}`);
            draftOrchestrationAttempt();
          }
        }, 1000);
      } else {
        socket.emit('kill');
      }
    };

    if (draftInstance) {
      debug('Sent on first try.');
      sendDraftOrchestration();
    } else {
      draftOrchestrationAttempt();
    }

    if (draftInstance) {
      draftInstance.updateUserStatus(userId, true);
    }

    socket.on('draft_orchestration_preload_success', () => {
      const preloadData = {
        draftHistory: draftInstance.getDraftHistory(),
        futurePicks: draftInstance.createFuturePicks(draftInstance.getCurrentPickIndex()),
        userRoster: draftInstance.getUserRoster(userId),
        currentPickUserId: draftInstance.getCurrentUserPick(),
        isPaused: draftInstance.isDraftPaused(),
        nextUserPick: draftInstance.getNextPickNumber(userId),
      };
      debug(`userId: ${userId} has successfully downloaded setup data`);
      debug(`userId that is sent to client: ${userId}`);
      socket.emit('draft_orchestration_load', preloadData);
      io.emit('user_status', { userId, online: true });
    });

    // Client drafts a player
    socket.on('draft_player', (selectedPlayerId) => {
      debug(userId);
      const roundEventData = draftInstance.draftPlayer(selectedPlayerId, userId);
      if (roundEventData === 'FAIL_NOT_USER_TURN') {
        // Tell user that you can't draft out of turn
        debug(`User ${userId} is trying to draft out of turn. BLOCK THIS IN CLIENT DUMBO!`);
      } else if (roundEventData === 'FAIL_DRAFT_PAUSED') {
        // tell user that draft is currently paused
      } else {
        io.emit('player_drafted', roundEventData);
        socket.emit('next_user_pick', draftInstance.getNextPickNumber(userId));

        // If draft is over, alert the users
        if (roundEventData.draftComplete) {
          io.emit('draft_complete', roundEventData);
        }

        // Check to see if new pick is keeper
        while (draftInstance.currentPickIsKeeper()) {
          const keeperPickData = draftInstance.draftKeeper();
          io.emit('player_drafted', keeperPickData);

          // If draft is over after going through keeper picks, alert the users
          if (keeperPickData.draftComplete) {
            io.emit('draft_complete', roundEventData);
          }
        }
      }
    });

    socket.on('get_user_roster', (requestedUserId) => {
      const roster = draftInstance.getUserRoster(requestedUserId);
      const userRosterData = {
        userId: requestedUserId,
        userRoster: roster,
      };
      socket.emit('get_user_roster_return', userRosterData);
    });

    // TODO: rewrite this monstrosity
    socket.on('search_player_by_position', (position) => {
      const outfieldPositions = ['rf', 'cf', 'lf'];

      const positionIncludes = (player, localPosition) => {
        return player.positions.toLowerCase().includes(localPosition);
      };

      const cleanedPosition = position.toLowerCase();
      const players = draftInstance.getPlayers();
      let playersByPosition = [];
      if (!cleanedPosition || cleanedPosition.toLowerCase() === 'all') {
        playersByPosition = players;
      } else if (cleanedPosition === 'of') {
        players.forEach((player) => {
          if (player.positions && outfieldPositions.some(positionIncludes(player, position))) {
            playersByPosition.push(player);
          }
        });
      } else if (cleanedPosition === 'c') {
        players.forEach((player) => {
          const positions = player.positions.split(',');
          const lowerCasePositions = positions.map((mappedPosition) => {
            return mappedPosition.toLowerCase();
          });
          if (lowerCasePositions.includes('c')) {
            playersByPosition.push(player);
          }
        });
      } else {
        players.forEach((player) => {
          if (player.positions && player.positions.toLowerCase().includes(cleanedPosition)) {
            playersByPosition.push(player);
          }
        });
      }
      socket.emit('search_player_by_position_return', playersByPosition);
    });

    socket.on('search_player_by_name', (playerSearchString) => {
      const cleanedPlayerSearchString = playerSearchString.toLowerCase();
      const players = draftInstance.getPlayers();
      let playersByName = [];
      if (!cleanedPlayerSearchString || cleanedPlayerSearchString === '') {
        playersByName = players;
      } else {
        players.forEach((player) => {
          if (player.player_name &&
              player.player_name.toLowerCase().includes(cleanedPlayerSearchString)) {
            playersByName.push(player);
          }
        });
      }
      socket.emit('search_player_by_name_return', playersByName);
    });

    socket.on('next_user_pick_request', (requestedUserId) => {
      socket.emit('next_user_pick', draftInstance.getNextPickNumber(requestedUserId));
    });

    // Admin socket responsibilities
    socket.on('admin_roll_back_pick', () => {
      if (draftInstance.isDraftPaused()) {
        draftInstance.rollbackPick().then(() => {
          const response = {
            draftHistory: draftInstance.getDraftHistory(),
            futurePicks: draftInstance.getFuturePicks(),
            userRoster: draftInstance.getUserRoster(draftInstance.currentPickUserId),
            currentPickUserId: draftInstance.getCurrentUserPick(),
            isPaused: draftInstance.isDraftPaused(),
            // TODO: just mark player as undrafted
            players: draftInstance.getPlayers(),
            previousPickUserId: draftInstance.getPreviousPickUserId(),
          };
          io.emit('admin_roll_back_pick_return', response);
        }).catch((error) => {
          const wrappedError = {
            error,
          };
          socket.emit('admin_roll_back_pick_return', wrappedError);
        });
      } else {
        const wrappedError = {
          error: 'Draft needs to be paused to rollback!',
        };
        socket.emit('admin_roll_back_pick_return', wrappedError);
      }
    });

    socket.on('toggle_pause_draft', (isPaused) => {
      if (isPaused) {
        debug('Draft paused.');
        draftInstance.pauseDraft();
      } else {
        debug('Draft resumed.');
        draftInstance.resumeDraft();
      }
      io.emit('toggle_pause_draft_return', isPaused);
    });

    // Heartbeat sync check
    // socket.on('heartbeat', (data) => {
    //
    // });

    socket.on('disconnect', () => {
      draftInstance.updateUserStatus(userId, false);
      io.emit('user_status', { userId, online: false });
      debug(`User ${socket.id} disconnected`);
    });
  });

  return router;
};
