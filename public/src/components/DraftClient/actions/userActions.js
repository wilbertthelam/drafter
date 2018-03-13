import actions from './../constants/actionTypes';

export const updateUsers = (users) => {
  return {
    type: actions.users.UPDATE_USERS,
    users,
  };
};

export const setUserStatus = (status) => {
  return {
    type: actions.users.UPDATE_USER_STATUS,
    status,
  };
};

export const setUserId = (userId) => {
  return {
    type: actions.users.SET_USER_ID,
    userId,
  };
};

export const markUserAsAdmin = (isAdmin) => {
  return {
    type: actions.users.MARK_USER_AS_ADMIN,
    isAdmin,
  };
};
