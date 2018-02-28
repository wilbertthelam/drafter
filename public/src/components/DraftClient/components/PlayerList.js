import React from 'react';
import PropTypes from 'prop-types';
import strings from './../constants/strings';
import PositionFilter from './PositionFilter';
import PlayerRow from './PlayerRow';
import './styles/PlayerList.scss';

class PlayerList extends React.Component {
  constructor() {
    super();
    this.onSearch = this.onSearch.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    // this.props.onPlayerSearch();
  }

  onSearchDebounced(event) {
    if (event && event.target) {
      this.props.changePlayerSearchString(event.target.value);
      this.props.onPlayerSearch(event.target.value);
    }
  }

  onSearch(event) {
    // TODO: figure out debounce
    // _.debounce(this.onSearchDebounced(event), 50);
    this.onSearchDebounced(event);
  }

  render() {
    let playerListDisplay;
    if (this.props.isLoading) {
      playerListDisplay = (<li>loading...</li>);
    }

    if (this.props.error) {
      playerListDisplay = (<li>Crap not working: {this.props.error}</li>);
    }

    if (this.props.players && this.props.players.length > 0) {
      playerListDisplay = this.props.players.map((player) => {
        return (
          <PlayerRow
            key={player.id}
            selectedPlayerId={this.props.selectedPlayerId}
            draftSelectedPlayer={this.props.draftSelectedPlayer}
            currentPickUserId={this.props.currentPickUserId}
            userId={this.props.userId}
            player={player}
            extendedPlayer={this.props.extendedPlayer}
            isPaused={this.props.isPaused}
            onPlayerRowClick={() => { return this.props.onPlayerSelect(player.id); }}
            onKeyPress={() => { return this.props.onPlayerSelect(player.id); }}
          />
        );
      });
    }

    return (
      <div className="player-searcher">
        <div className="search-filter">
          <input
            className="player-search-box"
            type="text"
            placeholder={strings.player_list.search_placeholder}
            onInput={this.onSearch}
            value={this.props.playerSearchString}
          />
          <PositionFilter filterBy={this.props.onPlayerSearchByPosition} />
        </div>
        <ul className="scroll-list">
          {playerListDisplay}
        </ul>
        <span>Current userId: {this.props.userId} </span>
        <span>Current pick userId: {this.props.currentPickUserId} </span>
        <span>Currently selected player: {this.props.selectedPlayerId} </span>
        <span>Is Draft Paused?: {this.props.isPaused ? 'yes' : 'no'} </span>
      </div>
    );
  }
}

PlayerList.propTypes = {
  userId: PropTypes.number.isRequired,
  currentPickUserId: PropTypes.number.isRequired,
  players: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    rank: PropTypes.number,
    player_name: PropTypes.string,
    mlb_team: PropTypes.string,
    positions: PropTypes.string,
    adp: PropTypes.string,
    notes: PropTypes.string,
  }).isRequired).isRequired,
  selectedPlayerId: PropTypes.number.isRequired,
  onPlayerSelect: PropTypes.func.isRequired,
  onPlayerSearch: PropTypes.func.isRequired,
  onPlayerSearchByPosition: PropTypes.func.isRequired,
  changePlayerSearchString: PropTypes.func.isRequired,
  error: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  playerSearchString: PropTypes.string.isRequired,
  draftSelectedPlayer: PropTypes.func.isRequired,
  // TODO: specify
  extendedPlayer: PropTypes.object.isRequired,
  isPaused: PropTypes.bool.isRequired,
};

export default PlayerList;
