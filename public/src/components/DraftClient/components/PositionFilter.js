import React from 'react';
import PropTypes from 'prop-types';
import strings from './../constants/strings';
import './styles/PositionFilter.scss';

const PositionFilter = ({ filterBy, toggleDraftedFilter, filterDrafted }) => {
  return (
    <ul className="position-filter">
      <li onClick={() => filterBy(strings.position_filter.all)}>{strings.position_filter.all}</li>
      <li onClick={() => filterBy(strings.position_filter.starting_pitcher)}>{strings.position_filter.starting_pitcher}</li>
      <li onClick={() => filterBy(strings.position_filter.relief_pitcher)}>{strings.position_filter.relief_pitcher}</li>
      <li onClick={() => filterBy(strings.position_filter.catcher)}>{strings.position_filter.catcher}</li>
      <li onClick={() => filterBy(strings.position_filter.first_baseman)}>{strings.position_filter.first_baseman}</li>
      <li onClick={() => filterBy(strings.position_filter.second_baseman)}>{strings.position_filter.second_baseman}</li>
      <li onClick={() => filterBy(strings.position_filter.shortstop)}>{strings.position_filter.shortstop}</li>
      <li onClick={() => filterBy(strings.position_filter.third_baseman)}>{strings.position_filter.third_baseman}</li>
      <li onClick={() => filterBy(strings.position_filter.outfielder)}>{strings.position_filter.outfielder}</li>
      <li onClick={() => filterBy(strings.position_filter.designated_hitter)}>{strings.position_filter.designated_hitter}</li>
      <li>
        <label htmlFor="hide-drafted">
          <input
            id="hide-drafted"
            type="checkbox"
            checked={filterDrafted}
            onClick={toggleDraftedFilter}
          />
          {strings.filter_drafted.hide_drafted}
        </label>
      </li>
    </ul>
  );
};

export default PositionFilter;

PositionFilter.propTypes = {
  filterBy: PropTypes.func.isRequired,
  toggleDraftedFilter: PropTypes.func.isRequired,
  filterDrafted: PropTypes.bool.isRequired,
};
