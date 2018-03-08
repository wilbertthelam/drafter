import React from 'react';
import PropTypes from 'prop-types';
import PlayerSearcher from './PlayerSearcher';
import History from './History';
import Ticker from './Ticker';
import Roster from './Roster';
import Admin from './Admin';
import Profile from './Profile';
import './../components/styles/DraftClientLayout.scss';

class DraftClientLayout extends React.Component {
  render() {
    return (
      <div className="draft-container">
        <div className="top-row">
          <Ticker />
        </div>
        <div className="middle-row">
          <div className="left-column">
            <Profile socket={this.props.socket} />
            <Roster socket={this.props.socket} />
          </div>
          <PlayerSearcher socket={this.props.socket} />
          <div className="right-column">
            <Admin socket={this.props.socket} />
            <History socket={this.props.socket} />
          </div>
        </div>
      </div>
    );
  }
}

export default DraftClientLayout;

DraftClientLayout.propTypes = {
  socket: PropTypes.object.isRequired,
};
