import { connect } from 'react-redux';
import * as playerSearcherActions from './../actions/playerSearcherActions';
import * as playerDrafterActions from './../actions/playerDrafterActions';
import PlayerList from './../components/PlayerList';

/**
 * Search for a player given the user inputted string
 */
const searchPlayer = (playerSearchString, socket) => {
  return (dispatch) => {
    dispatch(playerSearcherActions.searchPlayersLoading(true));
    socket.emit('search_player_by_name', playerSearchString);
    socket.on('search_player_by_name_return', (playersByName) => {
      dispatch(playerSearcherActions.searchPlayersLoading(false));
      dispatch(playerSearcherActions.searchPlayersSuccess(playersByName));
    });
  };
};

/**
 * Search for a player given the user selected position
 */
const searchPlayerByPosition = (position, socket) => {
  return (dispatch) => {
    dispatch(playerSearcherActions.searchPlayersLoading(true));

    // Clear player search string inside text box
    dispatch(playerSearcherActions.changePlayerSearchString(''));

    socket.emit('search_player_by_position', position);
    socket.on('search_player_by_position_return', (playersByPosition) => {
      dispatch(playerSearcherActions.searchPlayersLoading(false));
      dispatch(playerSearcherActions.searchPlayersSuccess(playersByPosition));
    });
  };
};

const draftSelectedPlayer = (selectedPlayerId, userId, socket) => {
  return (dispatch) => {
    dispatch(playerDrafterActions.draftPlayerWaiting(true));
    socket.emit('draft_player', selectedPlayerId);
    dispatch(playerDrafterActions.draftPlayerStatus(true));

    // Update history for the current user
    const historyPlayerData = [{
      previousPickUserId: userId,
      previousPickPlayerId: selectedPlayerId,
    }];
    dispatch(playerDrafterActions.updateHistory(historyPlayerData));
    dispatch(playerDrafterActions.markPlayerAsDrafted(selectedPlayerId));
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
    onPlayerSearch: (playerSearchString) => {
      return dispatch(searchPlayer(playerSearchString, socket.socket));
    },
    onPlayerSearchByPosition: (position) => {
      return dispatch(searchPlayerByPosition(position, socket.socket));
    },
  };
};

const PlayerSearcher = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PlayerList);

export default PlayerSearcher;
