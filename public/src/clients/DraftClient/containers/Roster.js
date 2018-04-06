import { connect } from 'react-redux';
import RosterList from './../components/RosterList';
import * as playerDrafterActions from './../actions/playerDrafterActions';

const selectUserRoster = (selectedUserId, socket) => {
  return (dispatch) => {
    if (selectedUserId) {
      socket.emit('get_user_roster', selectedUserId);
      return dispatch(playerDrafterActions.updateCurrentSelectedUserRosterId(selectedUserId));
    }
    return dispatch();
  };
};

const mapStateToProps = (state) => {
  return {
    selectedPlayerId: state.playerSearcher.selectedPlayerId,
    userRoster: state.playerSearcher.userRoster,
    users: state.playerSearcher.users,
    currentSelectedUserRosterId: state.playerSearcher.currentSelectedUserRosterId,
    rosterPositions: state.playerSearcher.rosterPositions,
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
