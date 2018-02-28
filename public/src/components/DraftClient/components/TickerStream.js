import React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import ActivePick from './ActivePick';
import './styles/TickerStream.scss';

class TickerStream extends React.Component {
  render() {
    const users = this.props.users;
    const pickList = this.props.futurePicks.map((pick, index) => {
      const foundUser = _.find(users, (user) => {
        return user.id === pick.userId;
      });
      const online = foundUser.online;
      return (
        <ActivePick
          key={index}
          pick={pick}
          online={online}
        />
      );
    });

    return (
      <div className="ticker-stream">
        {pickList}
      </div>
    );
  }
}

export default TickerStream;

TickerStream.propTypes = {
  futurePicks: PropTypes.arrayOf(PropTypes.shape({
    userId: PropTypes.number,
    round: PropTypes.number,
    pickNumber: PropTypes.number,
    name: PropTypes.string,
    team: PropTypes.string,
  }).isRequired),
  // TODO: FLESH OUT
  users: PropTypes.array,
};

TickerStream.defaultProps = {
  users: [],
  futurePicks: [],
};
