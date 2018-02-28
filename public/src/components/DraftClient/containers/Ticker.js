import { connect } from 'react-redux';
import TickerStream from './../components/TickerStream';

const mapStateToProps = (state) => {
  return {
    currentPickUserId: state.playerSearcher.currentPickUserId,
    futurePicks: state.playerSearcher.futurePicks,
    users: state.playerSearcher.users,
  };
};

const Ticker = connect(mapStateToProps)(TickerStream);

export default Ticker;
