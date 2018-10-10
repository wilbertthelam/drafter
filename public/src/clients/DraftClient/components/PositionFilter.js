import React from 'react';
import PropTypes from 'prop-types';
import strings from './../constants/strings';
import sport from "./../currentSport";
import './styles/PositionFilter.scss';

const PositionFilter = ({
  filterBy,
  toggleDraftedFilter,
  filterDrafted,
  players,
}) => {
  if (sport === "baseball") {
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
  } else if (sport === "basketball") {
    return (
      <ul className="position-filter">
        <li onClick={() => filterBy(strings.position_filter.all, players)}>{strings.position_filter.all}</li>
        <li onClick={() => filterBy(strings.position_filter.pg, players)}>{strings.position_filter.pg}</li>
        <li onClick={() => filterBy(strings.position_filter.sg, players)}>{strings.position_filter.sg}</li>
        <li onClick={() => filterBy(strings.position_filter.sf, players)}>{strings.position_filter.sf}</li>
        <li onClick={() => filterBy(strings.position_filter.pf, players)}>{strings.position_filter.pf}</li>
        <li onClick={() => filterBy(strings.position_filter.c, players)}>{strings.position_filter.c}</li>
        <li onClick={() => filterBy(strings.position_filter.g, players)}>{strings.position_filter.g}</li>
        <li onClick={() => filterBy(strings.position_filter.f, players)}>{strings.position_filter.f}</li>
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
  }
  
};

export default PositionFilter;

PositionFilter.propTypes = {
  filterBy: PropTypes.func.isRequired,
  toggleDraftedFilter: PropTypes.func.isRequired,
  filterDrafted: PropTypes.bool.isRequired,
  players: PropTypes.array.isRequired,
};
