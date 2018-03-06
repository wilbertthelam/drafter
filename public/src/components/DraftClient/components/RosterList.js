import React from 'react';
import PropTypes from 'prop-types';
import strings from './../constants/strings';
import './styles/RosterList.scss';

class RosterList extends React.Component {
  render() {
    let rosterList = this.props.userRoster.map((player) => {
      return (
        <li key={player.playerId}>
          <span>{player.playerName}</span>
          <span>{player.positions}</span>
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
      <div className="roster-list">
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
};

RosterList.defaultProps = {
  userRoster: [],
  users: [],
};
