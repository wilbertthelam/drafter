import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import * as noteIcon from '@fortawesome/fontawesome-free-regular/faComment';

// import strings from './../constants/strings';
import DraftButton from './DraftButton';
import './styles/PlayerRow.scss';

const PlayerRow = ({
  onPlayerRowClick,
  onKeyPress,
  player,
  selectedPlayerId,
  draftSelectedPlayer,
  userId,
  currentPickUserId,
  isPaused,
  extendedPlayer,
}) => {
  const isUserTurn = userId === currentPickUserId;
  let displayDraftButton;
  if (
    !isPaused &&
    isUserTurn &&
    selectedPlayerId === player.id &&
    player.isDrafted === false
  ) {
    displayDraftButton = (
      <DraftButton
        draftSelectedPlayer={draftSelectedPlayer}
        selectedPlayerId={selectedPlayerId}
        userId={userId}
      />
    );
  }

  let displayExtendedPlayer;
  if (selectedPlayerId === player.id) {
    displayExtendedPlayer = (
      <div className="extended-player">
        <div className="advanced-stats">
          <div><span className="stat-label">ADP</span> <span>{player.adp}</span></div>
          <div><span className="stat-label">AB</span> <span>{player.AB || '---'}</span></div>
          <div><span className="stat-label">IP</span> <span>{player.IP || '---'}</span></div>
        </div>
        <div className="notes">
          <span className="note-icon">
            <FontAwesomeIcon icon={noteIcon} />
          </span>
          {player.notes}
        </div>
      </div>
    );
  }

  let className = 'player-row';
  if (selectedPlayerId === player.id) {
    className += ' selected-player-highlight';
  }
  if (player.isDrafted && player.isDrafted === true) {
    className += ' player-drafted';
  }

  let positionSpecificStats;
  if (player.positions.includes('SP') || player.positions.includes('RP')) {
    positionSpecificStats = (
      <span>
        <span className="stat"><span className="stat-label">W:</span> <span>{player.W}</span></span>
        <span className="stat"><span className="stat-label">K:</span> <span>{player.K}</span></span>
        <span className="stat"><span className="stat-label">SV:</span> <span>{player.SV}</span></span>
        <span className="stat"><span className="stat-label">ERA:</span> <span>{player.ERA}</span></span>
        <span className="stat"><span className="stat-label">WHIP:</span> <span>{player.WHIP}</span></span>
      </span>
    );
  } else {
    positionSpecificStats = (
      <span>
        <span className="stat"><span className="stat-label">R:</span> <span>{player.R}</span></span>
        <span className="stat"><span className="stat-label">HR:</span> <span>{player.HR}</span></span>
        <span className="stat"><span className="stat-label">SB:</span> <span>{player.SB}</span></span>
        <span className="stat"><span className="stat-label">RBI:</span> <span>{player.RBI}</span></span>
        <span className="stat"><span>{player.AVG}/{player.OBP}/{player.SLG}</span></span>
      </span>
    );
  }
  // <span className="player-id">id: {player.id}</span>
  return (
    <li
      onClick={onPlayerRowClick}
      onKeyPress={onKeyPress}
      className={className}
    >
      <div className="standard-row">
        <span className="rank">{player.rank}</span>
        <span className="positions">{player.positions}</span>
        <span className="player-name">{player.player_name} <span className="mlb-team">{player.mlb_team}</span></span>
        { positionSpecificStats }
        <span className="draft-button">{ displayDraftButton }</span>
      </div>
      { displayExtendedPlayer }
    </li>
  );
};

export default PlayerRow;

PlayerRow.propTypes = {
  onPlayerRowClick: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired,
  player: PropTypes.shape({
    id: PropTypes.number,
    rank: PropTypes.number,
    player_name: PropTypes.string,
    mlb_team: PropTypes.string,
    positions: PropTypes.string,
    adp: PropTypes.string,
    notes: PropTypes.string,
  }).isRequired,
  selectedPlayerId: PropTypes.number.isRequired,
  draftSelectedPlayer: PropTypes.func.isRequired,
  userId: PropTypes.number.isRequired,
  currentPickUserId: PropTypes.number.isRequired,
  extendedPlayer: PropTypes.object.isRequired,
  isPaused: PropTypes.bool.isRequired,
};
