import React from 'react';
import PropTypes from 'prop-types';
import strings from './../constants/strings';
import './styles/DraftButton.scss';

const DraftButton = ({
  draftSelectedPlayer,
  selectedPlayerId,
  userId,
}) => {
  return (
    <button
      className="draft-button"
      onClick={() => { return draftSelectedPlayer(selectedPlayerId, userId); }}
    >
      {strings.draft_button.draft}
      {selectedPlayerId}
    </button>
  );
};

export default DraftButton;

DraftButton.propTypes = {
  draftSelectedPlayer: PropTypes.func.isRequired,
  selectedPlayerId: PropTypes.number.isRequired,
  userId: PropTypes.number.isRequired,
};
