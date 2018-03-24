const draftId = 1;
const draftRounds = 20;
const draftUserOrder = [8, 6, 12, 15, 7, 4, 5, 11, 13, 9];
const draftUserRoster = {};
const isSnakeDraft = true;

const draftOrder = [];

let pickNumber = 1;
for (let i = 0; i < draftRounds; i += 1) {
  for (let j = 0; j < draftUserOrder.length; j += 1) {
    let userId = draftUserOrder[j];

    // If odd number round, use reverse order for snake draft
    if (isSnakeDraft && i % 2 === 1) {
      userId = draftUserOrder[draftUserOrder.length - j - 1];
    }

    const draftRoundItem = {
      userId,
      round: i + 1,
      pickNumber,
    };

    draftOrder.push(draftRoundItem);

    pickNumber += 1;
  }
}

// Manual overrides for draft trades
draftOrder.forEach((roundItem) => {
  // Kev and Andre swap 7th and 10th rounders, respectively
  if (roundItem.round === 7 && roundItem.userId === 5) {
    roundItem.userId = 12;
  } else if (roundItem.round === 10 && roundItem.userId === 12) {
    roundItem.userId = 5;
  }
});

draftUserOrder.forEach((user) => {
  draftUserRoster[user] = [];
});

const draftKeepers = [{
  userId: 6,
  playerId: 82,
  sacrificedPicks: [{
    round: 16,
    pickNumber: 159,
  }],
}, {
  userId: 6,
  playerId: 177,
  sacrificedPicks: [{
    round: 19,
    pickNumber: 182,
  }],
}, {
  userId: 13,
  playerId: 6,
  sacrificedPicks: [{
    round: 11,
    pickNumber: 109,
  }],
}, {
  userId: 13,
  playerId: 52,
  sacrificedPicks: [{
    round: 17,
    pickNumber: 169,
  }],
}, {
  userId: 12,
  playerId: 25,
  sacrificedPicks: [{
    round: 19,
    pickNumber: 183,
  }],
}, {
  userId: 12,
  playerId: 191,
  sacrificedPicks: [{
    round: 18,
    pickNumber: 178,
  }],
}, {
  userId: 8,
  playerId: 45,
  sacrificedPicks: [{
    round: 19,
    pickNumber: 181,
  }],
}, {
  userId: 8,
  playerId: 44,
  sacrificedPicks: [{
    round: 14,
    pickNumber: 140,
  }],
}, {
  userId: 9,
  playerId: 22,
  sacrificedPicks: [{
    round: 19,
    pickNumber: 190,
  }],
}, {
  userId: 9,
  playerId: 84,
  sacrificedPicks: [{
    round: 17,
    pickNumber: 170,
  }],
}, {
  userId: 5,
  playerId: 43,
  sacrificedPicks: [{
    round: 19,
    pickNumber: 187,
  }],
}, {
  userId: 5,
  playerId: 11,
  sacrificedPicks: [{
    round: 11,
    pickNumber: 107,
  }],
}, {
  userId: 11,
  playerId: 90,
  sacrificedPicks: [{
    round: 12,
    pickNumber: 113,
  }],
}, {
  userId: 7,
  playerId: 30,
  sacrificedPicks: [{
    round: 15,
    pickNumber: 145,
  }],
}, {
  userId: 7,
  playerId: 87,
  sacrificedPicks: [{
    round: 13,
    pickNumber: 125,
  }],
}, {
  userId: 4,
  playerId: 186,
  sacrificedPicks: [{
    round: 19,
    pickNumber: 186,
  }],
}, {
  userId: 4,
  playerId: 97,
  sacrificedPicks: [{
    round: 18,
    pickNumber: 175,
  }],
}];

module.exports = {
  draftUserRoster,
  draftKeepers,
  draftOrder,
  draftId,
};
