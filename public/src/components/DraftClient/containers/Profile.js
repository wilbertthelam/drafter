import { connect } from 'react-redux';
import ProfileBox from './../components/ProfileBox';

const mapStateToProps = (state) => {
  return {
    nextUserPick: state.playerSearcher.nextUserPick,
    currentPick: state.playerSearcher.futurePicks.length > 0 ?
      state.playerSearcher.futurePicks[0].pickNumber : 0,
  };
};

const Profile = connect(mapStateToProps)(ProfileBox);

export default Profile;
