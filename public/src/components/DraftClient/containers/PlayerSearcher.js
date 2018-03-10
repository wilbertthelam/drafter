import { connect } from 'react-redux';
import * as playerSearcherActions from './../actions/playerSearcherActions';
import * as playerDrafterActions from './../actions/playerDrafterActions';
import PlayerList from './../components/PlayerList';

/**
 * Search for a player given the user inputted string
 */
const searchPlayer = (playerSearchString, players) => {
  return (dispatch) => {
    dispatch(playerSearcherActions.searchPlayersLoading(true));
    const cleanedPlayerSearchString = playerSearchString.toLowerCase();
    players.forEach((player) => {
      if ((!playerSearchString || playerSearchString === '') ||
        (player.player_name &&
        player.player_name.toLowerCase().includes(cleanedPlayerSearchString))
      ) {
        player.hideOnBoard = false;
      } else {
        player.hideOnBoard = true;
      }
    });
    dispatch(playerSearcherActions.searchPlayersLoading(false));
    dispatch(playerSearcherActions.searchPlayersSuccess(players));
  };
};

/**
 * Search for a player given the user selected position
 */
const searchPlayerByPosition = (position, players) => {
  return (dispatch) => {
    dispatch(playerSearcherActions.searchPlayersLoading(true));

    // Clear player search string inside text box
    dispatch(playerSearcherActions.changePlayerSearchString(''));

    const cleanedPosition = position.toLowerCase();
    if (!cleanedPosition || cleanedPosition.toLowerCase() === 'all') {
      players.forEach((player) => {
        player.hideOnBoard = false;
      });
    } else if (cleanedPosition === 'of') {
      players.forEach((player) => {
        if (player.positions &&
          (player.positions.toLowerCase().includes('rf') ||
          player.positions.toLowerCase().includes('cf') ||
          player.positions.toLowerCase().includes('lf'))
        ) {
          player.hideOnBoard = false;
        } else {
          player.hideOnBoard = true;
        }
      });
    } else if (cleanedPosition === 'c') {
      players.forEach((player) => {
        const positions = player.positions.split(',');
        if (positions.includes('C')) {
          player.hideOnBoard = false;
        } else {
          player.hideOnBoard = true;
        }
      });
    } else {
      players.forEach((player) => {
        if (player.positions && player.positions.toLowerCase().includes(cleanedPosition)) {
          player.hideOnBoard = false;
        } else {
          player.hideOnBoard = true;
        }
      });
    }
    dispatch(playerSearcherActions.searchPlayersLoading(false));
    dispatch(playerSearcherActions.searchPlayersSuccess(players));
  };
};

const draftSelectedPlayer = (selectedPlayerId, userId, socket) => {
  return (dispatch) => {
    dispatch(playerDrafterActions.draftPlayerWaiting(true));
    socket.emit('draft_player', selectedPlayerId);
    dispatch(playerDrafterActions.draftPlayerStatus(true));
  };
};

const selectPlayerAndOpenExtended = (playerId) => {
  return (dispatch) => {
    const extendedPlayer = {
      name: 'Edgar Martinez',
      position: 'DH',
      rank: 11,
      isHallOfFame: true,
      playerId: 0,
    };
    dispatch(playerSearcherActions.selectPlayer(playerId));
    dispatch(playerSearcherActions.loadExtendedPlayer(extendedPlayer));
  };
};

const mapStateToProps = (state) => {
  return {
    selectedPlayerId: state.playerSearcher.selectedPlayerId,
    error: state.playerSearcher.error,
    isLoading: state.playerSearcher.isLoading,
    players: state.playerSearcher.players,
    playerSearchString: state.playerSearcher.playerSearchString,
    userId: state.playerSearcher.userId,
    currentPickUserId: state.playerSearcher.currentPickUserId,
    extendedPlayer: state.playerSearcher.extendedPlayer,
    isPaused: state.playerSearcher.isPaused,
    filterDrafted: state.playerSearcher.filterDrafted,
  };
};

const mapDispatchToProps = (dispatch, socket) => {
  return {
    onPlayerSelect: (playerId) => {
      return dispatch(selectPlayerAndOpenExtended(playerId));
    },
    changePlayerSearchString: (playerSearchString) => {
      return dispatch(playerSearcherActions.changePlayerSearchString(playerSearchString));
    },
    draftSelectedPlayer: (selectedPlayerId, userId) => {
      return dispatch(draftSelectedPlayer(selectedPlayerId, userId, socket.socket));
    },
    onPlayerSearch: (playerSearchString, players) => {
      return dispatch(searchPlayer(playerSearchString, players));
    },
    onPlayerSearchByPosition: (position, players) => {
      return dispatch(searchPlayerByPosition(position, players));
    },
    toggleDraftedFilter: () => {
      return dispatch(playerSearcherActions.toggleDraftedFilter());
    },
  };
};

const PlayerSearcher = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PlayerList);

export default PlayerSearcher;
