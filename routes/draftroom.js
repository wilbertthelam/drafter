const express = require('express');
const request = require('request');
const debug = require('debug')('drafter');
const DraftInstance = require('./draftInstance');

const router = express.Router();

const mockDraftOrder = [{
  userId: 2,
  round: 1,
  pickNumber: 1,
}, {
  userId: 3,
  round: 1,
  pickNumber: 2,
}, {
  userId: 2,
  round: 2,
  pickNumber: 3,
}, {
  userId: 3,
  round: 2,
  pickNumber: 4,
}, {
  userId: 2,
  round: 3,
  pickNumber: 5,
}, {
  userId: 3,
  round: 3,
  pickNumber: 6,
}, {
  userId: 2,
  round: 4,
  pickNumber: 7,
}, {
  userId: 3,
  round: 4,
  pickNumber: 8,
}, {
  userId: 2,
  round: 5,
  pickNumber: 9,
}, {
  userId: 3,
  round: 5,
  pickNumber: 10,
}];

const mockUserRoster = {
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
};


let draftInstance;

const loadPlayers = new Promise((resolve, reject) => {
  request('http://localhost:3000/api/players', { json: true }, (error, response) => {
    if (error) {
      return reject(error);
    }

    const rawPlayers = response.body && response.body.data;
    if (!rawPlayers && response.body && response.body.error) {
      return reject(response.body.error.originalError.message);
    } else if (!rawPlayers) {
      return reject(new Error('Unknown error retrieving players'));
    }
    const players = [];
    rawPlayers.forEach((player) => {
      const newPlayer = {
        isDrafted: false,
      };
      players.push(Object.assign({}, player, newPlayer));
    });
    return resolve(players);
  });
});

const loadUsers = new Promise((resolve, reject) => {
  request('http://localhost:3000/api/users', { json: true }, (error, response) => {
    if (error) {
      return reject(new Error(error));
    }

    const users = response.body && response.body.data;
    if (!users && response.body && response.body.error) {
      return reject(response.body.error.originalError.message);
    } else if (!users) {
      return reject(new Error('Unknown error retrieving users'));
    }
    // Add default status field
    const expandedUsers = [];
    users.forEach((user) => {
      const expandedUser = user;
      expandedUser.online = false;
      expandedUsers.push(expandedUser);
    });
    return resolve(expandedUsers);
  });
});

setTimeout(() => {
  Promise.all([loadPlayers, loadUsers]).then((values) => {
    const players = values[0];
    const users = values[1];

    draftInstance = new DraftInstance(
      players,
      users,
      mockDraftOrder,
      [],
      mockUserRoster,
    );
  }).catch((error) => {
    debug(`Failed to intialize server data: ${error}`);
  });
}, 1000);

// Connections
module.exports = (io) => {
  io.on('connection', (socket) => {
    // const socketUserId = socket.id;
    if (!(socket.request && socket.request.session && socket.request.session.userId)) {
      debug('Error with establishing user connection');
      socket.emit('force_refresh');
      return;
    }
    const userId = socket.request.session.userId;
    // const userId = userList.indexOf(socketUserId);
    draftInstance.updateUserStatus(userId, true);

    socket.emit('connection_verified', userId);
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

    socket.on('draft_orchestration_preload_success', () => {
      const preloadData = {
        draftHistory: draftInstance.getDraftHistory(),
        futurePicks: draftInstance.createFuturePicks(draftInstance.getCurrentPickIndex()),
        userRoster: draftInstance.getUserRoster(userId),
        currentPickUserId: draftInstance.getCurrentUserPick(),
        isPaused: draftInstance.getIsPaused(),
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

        // If draft is over, alert the users
        if (roundEventData.draftComplete) {
          io.emit('draft_complete', roundEventData);
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

    socket.on('search_player_by_position', (position) => {
      const cleanedPosition = position.toLowerCase();
      const players = draftInstance.getPlayers();
      let playersByPosition = [];
      if (!cleanedPosition || cleanedPosition.toLowerCase() === 'all') {
        playersByPosition = players;
      } else if (cleanedPosition === 'of') {
        players.forEach((player) => {
          if (
            player.positions &&
            (player.positions.toLowerCase().includes('rf') ||
            player.positions.toLowerCase().includes('cf') ||
            player.positions.toLowerCase().includes('lf'))
          ) {
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
          if (
            player.player_name &&
            player.player_name.toLowerCase().includes(cleanedPlayerSearchString)
          ) {
            playersByName.push(player);
          }
        });
      }
      socket.emit('search_player_by_name_return', playersByName);
    });

    // Admin socket responsibilities
    socket.on('admin_roll_back_pick', () => {
      draftInstance.rollbackPick().then(() => {
        const response = {
          draftHistory: draftInstance.getDraftHistory(),
          futurePicks: draftInstance.getFuturePicks(),
          userRoster: draftInstance.getUserRoster(draftInstance.currentPickUserId),
          currentPickUserId: draftInstance.getCurrentUserPick(),
          isPaused: draftInstance.getIsPaused(),
          // TODO: just mark player as undrafted
          players: draftInstance.getPlayers(),
          previousPickUserId: draftInstance.getPreviousPickUserId(),
        };
        io.emit('admin_roll_back_pick_return', response);
      }).catch((error) => {
        const wrappedError = {
          error,
        };
        io.emit('admin_roll_back_pick_return', wrappedError);
      });
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
