import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import * as playIcon from '@fortawesome/fontawesome-free-solid/faPlayCircle';
import * as pauseIcon from '@fortawesome/fontawesome-free-solid/faPauseCircle';
import * as undoIcon from '@fortawesome/fontawesome-free-solid/faUndoAlt';
import strings from './../constants/strings';
import './styles/AdminPanel.scss';

class AdminPanel extends React.Component {
  render() {
    const pauseText = this.props.isPaused ? strings.admin_panel.resume : strings.admin_panel.pause;
    const icon = this.props.isPaused ? playIcon : pauseIcon;
    return (
      <div className="admin-panel">
        <button onClick={() => { return this.props.toggleDraft(!this.props.isPaused); }}>
          <span><FontAwesomeIcon icon={icon} /> </span>
          <span>{pauseText}</span>
        </button>
        <button><FontAwesomeIcon icon={undoIcon} /> {strings.admin_panel.undo}</button>
      </div>
    );
  }
}

export default AdminPanel;

AdminPanel.propTypes = {
  toggleDraft: PropTypes.func.isRequired,
  isPaused: PropTypes.bool.isRequired,
};
