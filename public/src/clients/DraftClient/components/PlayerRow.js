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
      <div>
        <div className="stat"><div className="stat-label">W</div> <div>{player.W}</div></div>
        <div className="stat"><div className="stat-label">K</div> <div>{player.K}</div></div>
        <div className="stat"><div className="stat-label">SV</div> <div>{player.SV}</div></div>
        <div className="stat"><div className="stat-label">ERA</div> <div>{player.ERA}</div></div>
        <div className="stat"><div className="stat-label">WHIP</div> <div>{player.WHIP}</div></div>
      </div>
    );
  } else {
    const standardSlashLine = (
      <div className="stat">
        <div>{player.AVG}/{player.OBP}/{player.SLG}</div>
      </div>
    );
    positionSpecificStats = (
      <div>
        <div className="stat"><div className="stat-label">R</div> <div>{player.R}</div></div>
        <div className="stat"><div className="stat-label">HR</div> <div>{player.HR}</div></div>
        <div className="stat"><div className="stat-label">SB</div> <div>{player.SB}</div></div>
        <div className="stat"><div className="stat-label">RBI</div> <div>{player.RBI}</div></div>
        { selectedPlayerId !== player.id ? standardSlashLine : '' }
      </div>
    );
  }

  let playerRow = (
    <div className="standard-row">
      <div className="rank">{player.rank}</div>
      <div className="positions">{player.positions}</div>
      <div className="player-name">
        <span>
          <span>{player.player_name}</span>
          <span className="mlb-team">{player.mlb_team}</span>
        </span>
      </div>
      { positionSpecificStats }
    </div>
  );

  if (selectedPlayerId === player.id) {
    playerRow = (
      <div className="extended-player">
        <div className="player-header">
          <div className="rank">{player.rank}</div>
          <div className="positions">{player.positions} </div>
          <div className="player-name">
            {player.player_name}
            <span className="mlb-team">{player.mlb_team}</span>
          </div>
          <div className="draft-button">{ displayDraftButton }</div>
        </div>
        <div className="player-body">
          <div className="body-left">
            <div className="standard-stats">
              { positionSpecificStats }
            </div>
            <div className="slash-stats">
              <div>
                <div><div className="stat-label">AVG</div> <div>{player.AVG || '--'}</div></div>
                <div><div className="stat-label">OBP</div> <div>{player.OBP || '--'}</div></div>
                <div><div className="stat-label">SLG</div> <div>{player.SLG || '--'}</div></div>
              </div>
            </div>
            <div className="advanced-stats">
              <div>
                <div><div className="stat-label">ADP</div> <div>{player.adp}</div></div>
                <div><div className="stat-label">AB</div> <div>{player.AB || '--'}</div></div>
                <div><div className="stat-label">IP</div> <div>{player.IP || '--'}</div></div>
              </div>
            </div>
          </div>
          <div className="notes">
            <div>
              <span className="note-icon">
                <FontAwesomeIcon icon={noteIcon} />
              </span>
              {player.notes}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <li
      onClick={onPlayerRowClick}
      onKeyPress={onKeyPress}
      className={className}
    >
      { playerRow }
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
  isPaused: PropTypes.bool.isRequired,
};
