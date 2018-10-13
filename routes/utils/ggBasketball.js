const draftId = 2;
const draftRounds = 14;
const draftUserOrder = [24, 18, 20, 22, 17, 25, 23, 26, 21, 19];
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

const createSacrificedPick = (userId, round) => {
  const result = { round }
  const numTeams = draftUserOrder.length;
  const userPosition = draftUserOrder.findIndex((item) => userId === item);
  if (round % 2 === 0) {
    result.pickNumber = (round * numTeams) - userPosition; 
  } else {
    result.pickNumber = (round - 1) * numTeams + userPosition + 1;
  }
  return result;
};

// Manual overrides for draft trades
// draftOrder.forEach((roundItem) => {
//   // Kev and Andre swap 7th and 10th rounders, respectively
//   if (roundItem.round === 7 && roundItem.userId === 5) {
//     roundItem.userId = 12;
//   } else if (roundItem.round === 10 && roundItem.userId === 12) {
//     roundItem.userId = 5;
//   }
// });

draftUserOrder.forEach((user) => {
  draftUserRoster[user] = [];
});

const draftKeepers = [{
  userId: 23,
  playerId: 421,
  sacrificedPicks: [createSacrificedPick(23, 13)],
}, {
  userId: 23,
  playerId: 12,
  sacrificedPicks: [createSacrificedPick(23, 6)],
}, {
  userId: 20,
  playerId: 14,
  sacrificedPicks: [createSacrificedPick(20, 9)],
}, {
  userId: 26,
  playerId: 24,
  sacrificedPicks: [createSacrificedPick(26, 13)],
}, {
  userId: 26,
  playerId: 90,
  sacrificedPicks: [createSacrificedPick(26, 10)],
}, {
  userId: 25,
  playerId: 59,
  sacrificedPicks: [createSacrificedPick(25, 13)],
}, {
  userId: 25,
  playerId: 61,
  sacrificedPicks: [createSacrificedPick(25, 12)],
}, {
  userId: 21,
  playerId: 84,
  sacrificedPicks: [createSacrificedPick(21, 11)],
}, {
  userId: 21,
  playerId: 11,
  sacrificedPicks: [createSacrificedPick(21, 3)],
}, {
  userId: 17,
  playerId: 4,
  sacrificedPicks: [createSacrificedPick(17, 3)],
}, {
  userId: 19,
  playerId: 106,
  sacrificedPicks: [createSacrificedPick(19, 11)],
}, {
  userId: 19,
  playerId: 53,
  sacrificedPicks: [createSacrificedPick(19, 12)],
}, {
  userId: 24,
  playerId: 39,
  sacrificedPicks: [createSacrificedPick(24, 6)]
}, {
  userId: 24,
  playerId: 74,
  sacrificedPicks: [createSacrificedPick(24, 9)]
}, {
  userId: 18,
  playerId: 35,
  sacrificedPicks: [createSacrificedPick(18, 8)]
}, {
  userId: 18,
  playerId: 37,
  sacrificedPicks: [createSacrificedPick(18, 9)]
}];

module.exports = {
  draftUserRoster,
  draftKeepers,
  draftOrder,
  draftId,
};
