import { connect } from 'react-redux';
import RosterList from './../components/RosterList';
import * as playerDrafterActions from './../actions/playerDrafterActions';

const selectUserRoster = (selectedUserId, socket) => {
  return (dispatch) => {
    if (selectedUserId) {
      socket.emit('get_user_roster', selectedUserId);
      socket.on('get_user_roster_return', (selectedUserRoster) => {
        dispatch(playerDrafterActions
          .updateUserRoster(selectedUserRoster));
      });
    }
  };
};

const mapStateToProps = (state) => {
  return {
    selectedPlayerId: state.playerSearcher.selectedPlayerId,
    userRoster: state.playerSearcher.userRoster,
    users: state.playerSearcher.users,
  };
};

const mapDispatchToProps = (dispatch, socket) => {
  return {
    selectUserRoster: (selectedUserId) => {
      return dispatch(selectUserRoster(selectedUserId, socket.socket));
    },
  };
};

const Roster = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RosterList);

export default Roster;
