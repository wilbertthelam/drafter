import React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import strings from './../constants/strings';
import './styles/RosterList.scss';

class RosterList extends React.Component {
  constructor() {
    super();
    this.rosterPlayers = undefined;
  }

  playerFit(position, playerPosition) {
    const positionMap = {
      c: ['c'],
      '1b/3b': ['1b', '3b'],
      '2b/ss': ['2b', 'ss'],
      util: ['c', '1b', '2b', 'ss', '3b', 'rf', 'cf', 'lf', 'dh'],
      of: ['rf', 'cf', 'lf'],
      p: ['sp', 'rp'],
      rp: ['rp'],
      bench: ['c', '1b', '2b', 'ss', '3b', 'rf', 'cf', 'lf', 'dh', 'sp', 'rp'],
    };

    const mapping = positionMap[position.toLowerCase()];
    if (!mapping) {
      return false;
    }
    return mapping.includes(playerPosition.toLowerCase());
  }

  populatePositions() {
    // Create array for inputted players
    const rosterPlayers = [];
    this.props.rosterPositions.forEach(() => {
      rosterPlayers.push(undefined);
    });

    // Create map for # of positions => [...players]
    const positionCountMap = new Map();
    this.props.userRoster.forEach((player) => {
      const numPositions = player.positions.split(',').length;
      if (!positionCountMap.get(numPositions)) {
        positionCountMap.set(numPositions, [player]);
      } else {
        const existingArray = positionCountMap.get(numPositions);
        existingArray.push(player);
        positionCountMap.set(numPositions, existingArray);
      }
    });

    // Populate rosterMap with lowest position option players first
    const sortedKeys = _.sortBy(Array.from(positionCountMap.keys()));
    sortedKeys.forEach((positionCount) => {
      const positionCountPlayers = positionCountMap.get(positionCount);
      positionCountPlayers.forEach((player) => {
        const playerPositions = player.positions.split(',');
        let playerAssigned = false;
        playerPositions.forEach((playerPosition) => {
          this.props.rosterPositions.forEach((position, index) => {
            if (!playerAssigned &&
              !rosterPlayers[index] &&
              this.playerFit(position, playerPosition)
            ) {
              rosterPlayers[index] = player;
              playerAssigned = true;
            }
          });
        });
      });
    });

    this.rosterPlayers = rosterPlayers;
  }

  render() {
    this.populatePositions();
    let rosterList = this.rosterPlayers.map((player, index) => {
      return (
        <li key={index}>
          <span><b>{this.props.rosterPositions[index]} </b></span>
          <span>{player ? player.playerName : ''}</span>
          <span>{player ? player.positions : ''}</span>
        </li>
      );
    });

    if (!rosterList || rosterList.length === 0) {
      rosterList = (
        <li>{strings.draft_history.default_roster_message}</li>
      );
    }

    const userList = this.props.users.map((user) => {
      return (
        <option
          key={user.id}
          value={user.id}
          selected={user.id === this.props.currentSelectedUserRosterId}
          onClick={() => { return this.props.selectUserRoster(user.id); }}
        >
          {user.name}
        </option>
      );
    });

    return (
      <div className="component-boxes roster-list">
        <select>
          {userList}
        </select>
        <ul>
          {rosterList}
        </ul>
      </div>
    );
  }
}

export default RosterList;

RosterList.propTypes = {
  userRoster: PropTypes.arrayOf(PropTypes.shape({
    playerId: PropTypes.number,
    userId: PropTypes.number,
  }).isRequired),
  selectUserRoster: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    team: PropTypes.string,
    email: PropTypes.string,
  })),
  currentSelectedUserRosterId: PropTypes.number.isRequired,
  rosterPositions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

RosterList.defaultProps = {
  userRoster: [],
  users: [],
};
