import React from 'react';
import PropTypes from 'prop-types';
import strings from './../constants/strings';

import './styles/HistoryList.scss';

class HistoryList extends React.Component {
  render() {
    let historyList = this.props.draftHistory.map((playerData, index) => {
      const keeperPill = playerData && playerData.isKeeper && playerData.isKeeper === true ?
        (<span className="keeper-pill">K</span>) : '';
      return (
        <li key={index}>
          <span><b>{playerData.previousPickPickNumber}</b></span>
          { keeperPill }
          <span>{playerData.positions}</span>
          <span>{playerData.playerName}</span>
          <span>({playerData.name})</span>
        </li>
      );
    });

    if (!historyList || historyList.length === 0) {
      historyList = (
        <li>{strings.draft_history.default_history_message}</li>
      );
    }

    return (
      <div className="component-boxes history-list">
        <ul>
          {historyList}
        </ul>
      </div>
    );
  }
}

export default HistoryList;

HistoryList.propTypes = {
  draftHistory: PropTypes.arrayOf(PropTypes.shape({
    previousPickUserId: PropTypes.number,
    previousPickPlayerId: PropTypes.number,
  }).isRequired),
  // userId: PropTypes.number.isRequired,
};

HistoryList.defaultProps = {
  draftHistory: [],
};
