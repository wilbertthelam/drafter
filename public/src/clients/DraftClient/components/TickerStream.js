import React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import ActivePick from './ActivePick';
import strings from './../constants/strings';
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
          userId={this.props.userId}
        />
      );
    });

    let round;
    if (this.props.futurePicks && this.props.futurePicks.length > 0) {
      round = (
        <div className="active-pick">
          <div className="active-pick-body">
            <div className="round-number">
              {strings.ticker.round} {this.props.futurePicks[0].round}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="ticker-stream">
        {round}
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
  userId: PropTypes.number.isRequired,
};

TickerStream.defaultProps = {
  users: [],
  futurePicks: [],
};
