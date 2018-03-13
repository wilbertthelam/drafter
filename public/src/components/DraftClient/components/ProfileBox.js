import React from 'react';
import PropTypes from 'prop-types';
import strings from './../constants/strings';
import './styles/ProfileBox.scss';

class ProfileBox extends React.Component {
  render() {
    const pickDifference = this.props.nextUserPick - this.props.currentPick;
    let nextUserPickString;
    let nextUserPickDifference;
    let currentUserPickClass = '';

    if (pickDifference > 0) {
      if (this.props.nextUserPick > -1) {
        nextUserPickDifference = (
          <div>
            {strings.profile_box.next_pick_difference}{' '}
            {pickDifference} turn{pickDifference === 1 ? '' : 's'}.
          </div>);
      } else {
        nextUserPickString = (<div>{strings.profile_box.no_more_pick}</div>);
      }
    } else if (pickDifference === 0) {
      nextUserPickDifference = (
        <div>
          {strings.profile_box.turn_to_draft}
        </div>
      );
      currentUserPickClass = 'current-user-pick';
    } else {
      nextUserPickString = (<div>{strings.profile_box.no_more_pick}</div>);
    }

    return (
      <div className={`component-boxes profile-box ${currentUserPickClass}`}>
        <div className="profile-picture">
          <img
            src="https://pbs.twimg.com/profile_images/597190106647175168/e1_DjZH9_400x400.jpg"
            alt="Your profile"
          />
        </div>
        <div className="strings">
          {nextUserPickString}
          {nextUserPickDifference}
        </div>
      </div>
    );
  }
}

export default ProfileBox;

ProfileBox.propTypes = {
  nextUserPick: PropTypes.number.isRequired,
  currentPick: PropTypes.number.isRequired,
};
