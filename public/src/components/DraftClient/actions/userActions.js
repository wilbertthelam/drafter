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
