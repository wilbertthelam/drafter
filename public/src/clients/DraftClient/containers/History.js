import { connect } from 'react-redux';
import HistoryList from './../components/HistoryList';

const mapStateToProps = (state) => {
  return {
    draftHistory: state.playerSearcher.draftHistory,
    userId: state.playerSearcher.userId,
  };
};

const History = connect(mapStateToProps)(HistoryList);

export default History;
