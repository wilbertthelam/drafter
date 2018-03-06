import actions from './../constants/actionTypes';

export const draftPlayerWaiting = (isLoading) => {
  return {
    type: actions.playerDrafter.DRAFT_PLAYER_WAITING,
    isLoading,
  };
};

export const draftPlayerStatus = (isSuccess) => {
  return {
    type: actions.playerDrafter.DRAFT_PLAYER_STATUS,
    draftPlayerStatus: isSuccess,
  };
};

export const markPlayerAsDrafted = (playerId) => {
  return {
    type: actions.playerDrafter.DRAFT_PLAYER_REMOVE,
    playerId,
  };
};

export const setUserId = (userId) => {
  return {
    type: actions.playerDrafter.SET_USER_ID,
    userId,
  };
};

export const setCurrentPickUserId = (currentPickUserId) => {
  return {
    type: actions.playerDrafter.SET_CURRENT_PICK_USER_ID,
    currentPickUserId,
  };
};

export const updateHistory = (historyPlayerData) => {
  return {
    type: actions.playerDrafter.UPDATE_HISTORY,
    historyPlayerData,
  };
};

export const updateFuturePicks = (futurePicks) => {
  return {
    type: actions.playerDrafter.UPDATE_FUTURE_PICKS,
    futurePicks,
  };
};

export const updateUserRoster = (userRoster) => {
  return {
    type: actions.playerDrafter.UPDATE_USER_ROSTER,
    userRoster,
  };
};

export const updateDraftPauseState = (isPaused) => {
  return {
    type: actions.playerDrafter.UPDATE_DRAFT_PAUSE_STATE,
    isPaused,
  };
};

export const rollbackDraftHistory = () => {
  return {
    type: actions.playerDrafter.ROLLBACK_DRAFT_HISTORY,
  };
};

export const updateCurrentSelectedUserRosterId = (currentSelectedUserRosterId) => {
  return {
    type: actions.playerDrafter.UPDATE_CURRENT_SELECTED_USER_ROSTER_ID,
    currentSelectedUserRosterId,
  };
};
