import actions from './../constants/actionTypes';

export const searchPlayersError = (error) => {
  return {
    type: actions.playerSearcher.SEARCH_PLAYERS_ERROR,
    error,
  };
};

export const searchPlayersLoading = (isLoading) => {
  return {
    type: actions.playerSearcher.SEARCH_PLAYERS_LOADING,
    isLoading,
  };
};

export const searchPlayersSuccess = (players) => {
  return {
    type: actions.playerSearcher.SEARCH_PLAYERS_SUCCESS,
    players,
  };
};

export const changePlayerSearchString = (playerSearchString) => {
  return {
    type: actions.playerSearcher.CHANGE_PLAYER_SEARCH_STRING,
    playerSearchString,
  };
};

export const selectPlayer = (playerId) => {
  return {
    type: actions.playerSearcher.SELECT_PLAYER,
    playerId,
  };
};

export const loadExtendedPlayer = (playerExtended) => {
  return {
    type: actions.playerSearcher.LOAD_EXTENDED_PLAYER,
    playerExtended,
  };
};

export const toggleDraftedFilter = () => {
  return {
    type: actions.playerSearcher.TOGGLE_DRAFTED_FILTER,
  };
};
