import React from 'react';
import PropTypes from 'prop-types';
import strings from './../constants/strings';
import './styles/PositionFilter.scss';

const PositionFilter = ({ filterBy, toggleDraftedFilter, filterDrafted, players }) => {
  return (
    <ul className="position-filter">
      <li onClick={() => filterBy(strings.position_filter.all, players)}>{strings.position_filter.all}</li>
      <li onClick={() => filterBy(strings.position_filter.starting_pitcher, players)}>{strings.position_filter.starting_pitcher}</li>
      <li onClick={() => filterBy(strings.position_filter.relief_pitcher, players)}>{strings.position_filter.relief_pitcher}</li>
      <li onClick={() => filterBy(strings.position_filter.catcher, players)}>{strings.position_filter.catcher}</li>
      <li onClick={() => filterBy(strings.position_filter.first_baseman, players)}>{strings.position_filter.first_baseman}</li>
      <li onClick={() => filterBy(strings.position_filter.second_baseman, players)}>{strings.position_filter.second_baseman}</li>
      <li onClick={() => filterBy(strings.position_filter.shortstop, players)}>{strings.position_filter.shortstop}</li>
      <li onClick={() => filterBy(strings.position_filter.third_baseman, players)}>{strings.position_filter.third_baseman}</li>
      <li onClick={() => filterBy(strings.position_filter.outfielder, players)}>{strings.position_filter.outfielder}</li>
      <li onClick={() => filterBy(strings.position_filter.designated_hitter, players)}>{strings.position_filter.designated_hitter}</li>
      <li>
        <label htmlFor="hide-drafted">
          <input
            id="hide-drafted"
            type="checkbox"
            checked={filterDrafted}
            onChange={toggleDraftedFilter}
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
  players: PropTypes.array.isRequired,
};
