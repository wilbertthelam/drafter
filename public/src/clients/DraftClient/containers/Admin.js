import { connect } from 'react-redux';
import AdminPanel from './../components/AdminPanel';
import * as playerDrafterActions from './../actions/playerDrafterActions';

const mapStateToProps = (state) => {
  return {
    isPaused: state.playerSearcher.isPaused,
    isAdmin: state.playerSearcher.isAdmin,
  };
};

const toggleDraft = (isPaused, socket) => {
  return (dispatch) => {
    socket.emit('toggle_pause_draft', isPaused);
    dispatch(playerDrafterActions.updateDraftPauseState(isPaused));
  };
};

const rollbackPick = (socket) => {
  return () => {
    socket.emit('admin_roll_back_pick');
  };
};

const mapDispatchToProps = (dispatch, socket) => {
  return {
    toggleDraft: (isPaused) => {
      return dispatch(toggleDraft(isPaused, socket.socket));
    },
    rollbackPick: () => {
      return dispatch(rollbackPick(socket.socket));
    },
  };
};

const Admin = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AdminPanel);

export default Admin;
