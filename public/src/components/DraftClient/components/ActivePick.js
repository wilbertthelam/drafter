import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import * as availableIcon from '@fortawesome/fontawesome-free-solid/faCircle';
import * as offlineIcon from '@fortawesome/fontawesome-free-regular/faCircle';

const ActivePick = ({
  pick,
  online,
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

  return (
    <div className="active-pick">
      <div className="active-pick-body">
        <div className={`pick-number ${keeperClass}`}>
          <span>{pick.pickNumber}</span>
        </div>
        <div className="active-pick-info">
          <div className="pick-team">{onlineIcon} {pick.team}</div>
          <div className="pick-name">{pick.name}</div>
        </div>
      </div>
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
};
