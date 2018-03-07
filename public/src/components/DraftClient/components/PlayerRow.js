import React from 'react';
import PropTypes from 'prop-types';
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
    selectedPlayerId === player.id
    && player.isDrafted === false
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
        <span>ADP: {player.adp}</span>
        <span>Notes: {player.notes}</span>
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
        <span className="mlb_team">IP: {player.IP}</span>
        <span className="mlb_team">W: {player.W}</span>
        <span className="mlb_team">K: {player.K}</span>
        <span className="mlb_team">SV: {player.SV}</span>
        <span className="mlb_team">ERA: {player.ERA}</span>
        <span className="mlb_team">WHIP: {player.WHIP}</span>
      </span>
    );
  } else {
    positionSpecificStats = (
      <span>
        <span className="mlb_team">AB: {player.AB}</span>
        <span className="mlb_team">R: {player.R}</span>
        <span className="mlb_team">HR: {player.HR}</span>
        <span className="mlb_team">RBI: {player.RBI}</span>
        <span className="mlb_team">SB: {player.SB}</span>
        <span className="mlb_team">{player.AVG}/{player.OBP}/{player.SLG}</span>
      </span>
    );
  }

  return (
    <li
      onClick={onPlayerRowClick}
      onKeyPress={onKeyPress}
      className={className}
    >
      <span className="player-id">id: {player.id}</span>
      <span className="rank">{player.rank}</span>
      <span className="positions">{player.positions}</span>
      <span className="player-name">{player.player_name} {player.mlb_team}</span>
      { positionSpecificStats }
      <span className="draft-button">{ displayDraftButton }</span>
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
