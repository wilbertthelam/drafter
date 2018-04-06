import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import * as availableIcon from '@fortawesome/fontawesome-free-solid/faCircle';
import * as offlineIcon from '@fortawesome/fontawesome-free-regular/faCircle';

const ActivePick = ({
  pick,
  online,
  userId,
}) => {
  let onlineIcon;
  if (online) {
    onlineIcon = (<span className="available-icon"><FontAwesomeIcon icon={availableIcon} /></span>);
  } else {
    onlineIcon = (<span className="offline-icon"><FontAwesomeIcon icon={offlineIcon} /></span>);
  }

  let keeperClass = '';
  if (pick.isKeeper) {
    keeperClass = 'keeper-highlight';
  }

  let userTurnClass = '';
  if (pick.userId === userId) {
    userTurnClass = 'user-turn';
  }

  let pickPill;
  if (!pick.isKeeper) {
    pickPill = (
      <div className="active-pick-body">
        <div className="pick-number">
          <span>{pick.pickNumber}</span>
        </div>
        <div className="active-pick-info">
          <div className="pick-team">{onlineIcon} {pick.name}</div>
          <div className="pick-name">{pick.team}</div>
        </div>
      </div>
    );
  } else {
    pickPill = (
      <div className="active-pick-body">
        <div className={`pick-number ${keeperClass}`}>
          <span>K</span>
        </div>
        <div className="active-pick-info faded">
          <div className="pick-team">{onlineIcon} {pick.team}</div>
          <div className="pick-name">{pick.name}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`active-pick ${userTurnClass}`}>
      { pickPill }
    </div>
  );
};

export default ActivePick;

ActivePick.propTypes = {
  pick: PropTypes.shape({
    userId: PropTypes.number,
    round: PropTypes.number,
    pickNumber: PropTypes.number,
    name: PropTypes.string,
    team: PropTypes.string,
  }).isRequired,
  online: PropTypes.bool.isRequired,
  userId: PropTypes.number.isRequired,
};
