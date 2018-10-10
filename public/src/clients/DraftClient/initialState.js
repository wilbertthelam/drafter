import sport from './currentSport';

let hardCodedPositions = [];
if (sport === "baseball") {
  hardCodedPositions = [
    'C',
    '1B/3B',
    '1B/3B',
    '2B/SS',
    '2B/SS',
    'OF',
    'OF',
    'OF',
    'UTIL',
    'UTIL',
    'P',
    'P',
    'P',
    'P',
    'P',
    'RP',
    'RP',
    'BENCH',
    'BENCH',
    'BENCH',
  ];
} else {
  hardCodedPositions = [
    'PG',
    'SG',
    'SF',
    'PF',
    'C',
    'G',
    'F',
    'UTIL',
    'UTIL',
    'UTIL',
    'BENCH',
    'BENCH',
    'BENCH',
    'BENCH'
  ]
}

const initialState = {
  players: [],
  extendedPlayer: {},
  selectedPlayerId: 0,
  playerSearchString: '',
  isLoading: false,
  error: '',
  userId: -1,
  currentPickUserId: -1,
  draftHistory: [],
  futurePicks: [],
  userRoster: [],
  users: [],
  isPaused: false,
  currentSelectedUserRosterId: 0,
  filterDrafted: true,
  nextUserPick: -1,
  rosterPositions: hardCodedPositions,
  isAdmin: false,
};

export default initialState;
