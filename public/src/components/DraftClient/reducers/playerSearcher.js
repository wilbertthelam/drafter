import * as _ from 'lodash';
import actions from './../constants/actionTypes';

const getPlayerFromId = (playerId, state) => {
  if (!state.players) {
    return {};
  }
  return _.find(state.players, (player) => {
    return player.id === playerId;
  });
};

const getUserFromId = (userId, state) => {
  if (!state.users) {
    return {};
  }
  return _.find(state.users, (user) => {
    return user.id === userId;
  });
};

const playerSearcher = (state = {}, action) => {
  switch (action.type) {
    case actions.playerSearcher.CHANGE_PLAYER_SEARCH_STRING: {
      const newState = {
        playerSearchString: action.playerSearchString,
      };
      return Object.assign({}, state, newState);
    }
    case actions.playerSearcher.SELECT_PLAYER: {
      const newState = {
        selectedPlayerId: action.playerId,
      };
      return Object.assign({}, state, newState);
    }
    case actions.playerSearcher.SEARCH_PLAYERS_ERROR: {
      const newState = {
        error: action.error,
      };
      return Object.assign({}, state, newState);
    }
    case actions.playerSearcher.SEARCH_PLAYERS_LOADING: {
      const newState = {
        isLoading: action.isLoading,
      };
      return Object.assign({}, state, newState);
    }
    case actions.playerSearcher.SEARCH_PLAYERS_SUCCESS: {
      const newState = {
        players: action.players,
      };
      return Object.assign({}, state, newState);
    }
    case actions.playerSearcher.LOAD_EXTENDED_PLAYER: {
      const newState = {
        playerExtended: action.playerExtended,
      };
      return Object.assign({}, state, newState);
    }
    case actions.playerDrafter.DRAFT_PLAYER_REMOVE: {
      const newPlayerState = [];
      state.players.forEach((player) => {
        if (player.id === action.playerId) {
          const revisedPlayer = {
            isDrafted: true,
          };
          newPlayerState.push(Object.assign({}, player, revisedPlayer));
        } else {
          newPlayerState.push(player);
        }
      });

      const newState = {
        players: newPlayerState,
      };
      return Object.assign({}, state, newState);
    }
    case actions.playerDrafter.SET_USER_ID: {
      const newState = {
        userId: action.userId,
      };
      return Object.assign({}, state, newState);
    }
    case actions.playerDrafter.SET_CURRENT_PICK_USER_ID: {
      const newState = {
        currentPickUserId: action.currentPickUserId,
      };
      return Object.assign({}, state, newState);
    }
    case actions.playerDrafter.UPDATE_HISTORY: {
      const newPlayerHistory = [];
      action.historyPlayerData.forEach((historyPlayer) => {
        const player = getPlayerFromId(historyPlayer.previousPickPlayerId, state);
        const user = getUserFromId(historyPlayer.previousPickUserId, state);
        const historyPlayerData = {
          previousPickUserId: historyPlayer.previousPickUserId,
          previousPickPlayerId: historyPlayer.previousPickPlayerId,
          previousPickRound: historyPlayer.previousPickRound,
          previousPickPickNumber: historyPlayer.previousPickPickNumber,
        };

        // Add supplementary data for view
        if (player && user) {
          historyPlayerData.playerName = player.player_name;
          historyPlayerData.positions = player.positions;
          historyPlayerData.mlbTeam = player.mlb_team;
          historyPlayerData.name = user.name;
          historyPlayerData.team = user.team;

          newPlayerHistory.unshift(historyPlayerData);
        }
      });

      const newHistoryState = newPlayerHistory.concat(state.draftHistory);
      const newState = {
        draftHistory: newHistoryState,
      };
      return Object.assign({}, state, newState);
    }
    case actions.playerDrafter.UPDATE_FUTURE_PICKS: {
      const expandedFuturePicks = [];
      action.futurePicks.forEach((pick) => {
        const expandedPick = pick;
        const expandedUserInfo = getUserFromId(pick.userId, state);
        if (expandedUserInfo) {
          expandedPick.name = expandedUserInfo.name;
          expandedPick.team = expandedUserInfo.team;
          expandedFuturePicks.push(expandedPick);
        }
      });
      const newState = {
        futurePicks: expandedFuturePicks,
      };
      return Object.assign({}, state, newState);
    }

    case actions.playerDrafter.UPDATE_USER_ROSTER: {
      const newUserRoster = [];
      action.userRoster.forEach((userRosterPlayer) => {
        const player = getPlayerFromId(userRosterPlayer.playerId, state);
        const userRosterPlayerData = {
          userId: userRosterPlayer.userId,
          playerId: userRosterPlayer.playerId,
        };

        // Add supplementary data for view
        if (player) {
          userRosterPlayerData.playerName = player.player_name;
          userRosterPlayerData.positions = player.positions;
          userRosterPlayerData.mlbTeam = player.mlb_team;
        }

        newUserRoster.push(userRosterPlayerData);
      });

      const newState = {
        userRoster: newUserRoster,
      };
      return Object.assign({}, state, newState);
    }
    case actions.users.UPDATE_USERS: {
      const newState = {
        users: action.users,
      };
      return Object.assign({}, state, newState);
    }
    case actions.playerDrafter.UPDATE_DRAFT_PAUSE_STATE: {
      const newState = {
        isPaused: action.isPaused,
      };
      return Object.assign({}, state, newState);
    }
    default:
      return state;
  }
};

export default playerSearcher;
