const draftId = 0;

const mockDraftOrder = [{
  userId: 2,
  round: 1,
  pickNumber: 1,
}, {
  userId: 3,
  round: 1,
  pickNumber: 2,
}, {
  userId: 2,
  round: 2,
  pickNumber: 3,
}, {
  userId: 3,
  round: 2,
  pickNumber: 4,
}, {
  userId: 2,
  round: 3,
  pickNumber: 5,
}, {
  userId: 3,
  round: 3,
  pickNumber: 6,
}, {
  userId: 2,
  round: 4,
  pickNumber: 7,
}, {
  userId: 2,
  round: 4,
  pickNumber: 8,
}, {
  userId: 2,
  round: 5,
  pickNumber: 9,
}, {
  userId: 2,
  round: 5,
  pickNumber: 10,
}, {
  userId: 2,
  round: 6,
  pickNumber: 1,
}, {
  userId: 2,
  round: 7,
  pickNumber: 2,
}, {
  userId: 2,
  round: 8,
  pickNumber: 3,
}, {
  userId: 2,
  round: 9,
  pickNumber: 4,
}, {
  userId: 2,
  round: 10,
  pickNumber: 5,
}, {
  userId: 2,
  round: 11,
  pickNumber: 6,
}, {
  userId: 2,
  round: 12,
  pickNumber: 7,
}, {
  userId: 2,
  round: 13,
  pickNumber: 8,
}, {
  userId: 2,
  round: 14,
  pickNumber: 9,
}, {
  userId: 2,
  round: 15,
  pickNumber: 10,
}];

const mockUserRoster = {
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
};

const mockKeepers = [{
  userId: 2,
  playerId: 3, // Nolan Arenado
  sacrificedPicks: [{
    round: 2,
    pickNumber: 3,
  }],
}, {
  userId: 3,
  playerId: 1, // Mike Trout
  sacrificedPicks: [{
    round: 2,
    pickNumber: 4,
  }],
}];

module.exports = {
  mockUserRoster,
  mockKeepers,
  mockDraftOrder,
  draftId,
};
