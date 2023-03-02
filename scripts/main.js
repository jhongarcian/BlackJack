const dealerHand = document.getElementById("dealer-hand");
const playerHand = document.getElementById("player-hand");
const deck = [];
const suits = ["hearts", "spades", "clubs", "diamonds"];
const ranks = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"];
const cardCover = { rank: "0", suit: "cover", pointValue: 0 };
const dealerPoints = document.getElementById("dealer-points");
const playerPoints = document.getElementById("player-points");
const hitButton = document.getElementById("hit-button");
const playerStand = document.getElementById("stand-button");
const message = document.getElementById("messages");
const hiddenCard = [];
const deckCountDisplay = document.getElementById("deck-count");
const deckDisplay = document.getElementById("deck-container");
const dealerScoreDisplay = document.getElementById("dealer-score");
const playerScoreDisplay = document.getElementById("player-score");
const POINT_VAL = 1;
let playerScore = 0;
let dealerScore = 0;

let resultDealer = 0;
let resultPlayer = 0;

const makeDeck = (rank, suit) => {
  const card = {
    rank: rank,
    suit: suit,
    pointValue: rank > 10 ? 10 : rank,
  };
  deck.push(card);
};

for (let suit of suits) {
  for (const rank of ranks) {
    makeDeck(rank, suit);
    // add a function to create multiples decks at the begining
  }
}

const handleClick = (e) => {
  const deckRandom = shuffle(deck);
  if (e.target.matches("#deal-button") && e.target.dataset.start === "true") {
    // Two cards for the dealer
    kindOfGame({ handFor: dealerHand, card: deckRandom.pop() });
    kindOfGame({ handFor: dealerHand, card: deckRandom.pop() });
    // Two cards for the Player
    kindOfGame({ handFor: playerHand, card: deckRandom.pop() });
    kindOfGame({ handFor: playerHand, card: deckRandom.pop() });
    // Setting the data- for the hand turn and the deal
    e.target.dataset.start = false;
    dealerHand.dataset.turn = false;
    playerHand.dataset.turn = true;
    hitButton.dataset.start = true;
    getSecondCardFromDealer(true, false);
    calculatePointsAndPrintThem();
    isBlackJack();
    // Display the length and the deck
    displayDeckCount(deckRandom);
  }
  if (e.target.matches("#hit-button")) {
    if (playerHand.dataset.turn === "true") {
      kindOfGame({ handFor: playerHand, card: deckRandom.pop() });
      calculatePointsAndPrintThem();
      isPlayerPoints21(deckRandom);
      isBlackJack();
      bust();
      // Display the length and the deck
      displayDeckCount(deckRandom);
    }
  }
  if (e.target.matches("#stand-button")) {
    if (playerStand.dataset.start === "false") return;
    playerHand.dataset.turn = false;
    dealerHand.dataset.turn = true;
    playerStand.dataset.start = false;
    getSecondCardFromDealer(false, true);
    dealerReachedMaxHit(deckRandom);
    calculatePointsAndPrintThem();
    bust();
    whoIsTheWinner();
    // Display the length and the deck
    displayDeckCount(deckRandom);
  }
  if (e.target.matches("#reset-button")) {
    resetGame();
  }
};

const bust = () => {
  if (Number(dealerPoints.textContent) > 21) {
    message.textContent = "Dealer Busted";
    playerScore += 1;
    printTheScore();
  }
  if (Number(playerPoints.textContent) > 21) {
    message.textContent = "Player Busted";
    dealerScore += 1;

    getSecondCardFromDealer(false, true);
    calculatePointsAndPrintThem();
    whoIsTheWinner();
    printTheScore();
  }
};

const dealerReachedMaxHit = (deck) => {
  const dealerArray = getDealerHandCards();

  let isAceInArray = [];
  dealerArray.forEach((node) => {
    if (node.dataset.value === "ace") {
      isAceInArray.push(node);
    }
  });

  if (resultDealer < 17 || resultDealer < resultPlayer) {
    while (resultDealer < 17) {
      kindOfGame({ handFor: dealerHand, card: deck.pop() });
      calculatePointsAndPrintThem();
    }
  } else {
    dealerHand.dataset.turn = false;
  }
};

const displayDeckCount = (deckRandom) => {
  const deckCountLenght = document.getElementById("deck-length");
  deckCountLenght.textContent = deckRandom.length;
  console.log(deckRandom);
  for (let i = 0; i <= deckRandom.length; i++) {
    const newCard = document.createElement("img");
    newCard.setAttribute(
      "src",
      `../images/${cardCover.rank}_of_${cardCover.suit}.png`
    );
    newCard.setAttribute("style", `top: ${i * 0.1}px`);
    deckCountDisplay.appendChild(newCard);
  }
};

const doCalculationPointsForDealer = (dealer) => {
  const dealerPoints = dealer.querySelectorAll(`[data-value]`);
  let dealerResult = [];

  dealerPoints.forEach((point) => {
    if (
      point.dataset.value === "jack" ||
      point.dataset.value === "queen" ||
      point.dataset.value === "king"
    ) {
      dealerResult.push(10);
      return;
    } else if (point.dataset.value === "ace") {
      dealerResult.push(point.dataset.value);
      return;
    } else {
      dealerResult.push(Number(point.dataset.value));
    }
  });
  return dealerResult;
};

const doCalculationPointsForPlayer = (player) => {
  const playerPoints = player.querySelectorAll(`[data-value]`);
  let playerResult = [];

  playerPoints.forEach((point) => {
    if (
      point.dataset.value === "jack" ||
      point.dataset.value === "queen" ||
      point.dataset.value === "king"
    ) {
      playerResult.push(10);
      return;
    } else if (point.dataset.value === "ace") {
      playerResult.push(point.dataset.value);
      return;
    } else {
      playerResult.push(Number(point.dataset.value));
    }
  });
  return playerResult;
};

const doTotalCalculationPlayer = (arrayOfValues) => {
  let sumAces = 0;
  let sumNums = 0;

  for (let result of arrayOfValues) {
    if (result === "ace") {
      sumAces++;
    } else {
      sumNums += result;
    }
  }
  for (let i = 0; i < sumAces; i++) {
    console.log(sumAces);
    if (sumNums + 11 <= 21) {
      sumNums += 11;
    } else {
      sumNums += 1;
    }
  }
  return sumNums;
};

const doTotalCalculationDealer = (arrayOfValues) => {
  let sumAces = 0;
  let sumNums = 0;

  for (let result of arrayOfValues) {
    if (result === "ace") {
      sumAces++;
    } else {
      sumNums += result;
    }
  }

  for (let i = 0; i < sumAces; i++) {
    if (sumNums + 11 <= 21) {
      sumNums += 11;
    } else {
      sumNums += 1;
    }
  }
  return sumNums;
};

const calculatePointsAndPrintThem = () => {
  const dealerArrayOfPoints = doCalculationPointsForDealer(dealerHand);
  const playerArrayOfPoints = doCalculationPointsForPlayer(playerHand);
  resultPlayer = doTotalCalculationPlayer(playerArrayOfPoints);
  resultDealer = doTotalCalculationDealer(dealerArrayOfPoints);

  dealerPoints.textContent = resultDealer;
  playerPoints.textContent = resultPlayer;
};

const getDealerHandCards = () => {
  return document.querySelectorAll(`[data-player="dealer"]`);
};

const getPlayerHandCards = () => {
  return document.querySelectorAll(`[data-player="player"]`);
};

const getSecondCardFromDealer = (deal, hit) => {
  const dealerCards = getDealerHandCards();
  const _hiddenCard = hiddenCard[0];
  if (deal) {
    hiddenCard.push(dealerCards[1]);
    removeCardFromHand(dealerCards, 1);
    kindOfGame({ handFor: dealerHand, card: cardCover });
  }
  if (hit) {
    removeCardFromHand(dealerCards, 1);
    kindOfGame({
      handFor: dealerHand,
      card: {
        rank: _hiddenCard.dataset.value,
        suit: 1,
        pointValue: _hiddenCard.dataset.value,
      },
      src: _hiddenCard.src,
    });
  }
};

const kindOfGame = ({ handFor, card: { rank, suit, pointValue }, src }) => {
  for (let i = 1; i <= 1; i++) {
    const newCard = document.createElement("img");
    if (!src) {
      newCard.setAttribute("src", `../images/${rank}_of_${suit}.png`);
      newCard.setAttribute("data-value", pointValue);
      newCard.dataset.player = handFor === dealerHand ? "dealer" : "player";
      handFor.appendChild(newCard);
    } else {
      newCard.setAttribute("src", `${src}`);
      newCard.setAttribute("data-value", pointValue);
      newCard.dataset.player = handFor === dealerHand ? "dealer" : "player";
      handFor.appendChild(newCard);
    }
  }
};

const removeCardFromHand = (hand, index) => {
  hand[index].remove();
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

const isBlackJack = () => {
  if (resultPlayer === 21 && dealerPoints.textContent !== 21) {
    playerHand.dataset.turn = false;
    dealerHand.dataset.turn = false;
    playerStand.dataset.start = false;

    getSecondCardFromDealer(false, true);
    calculatePointsAndPrintThem();
    whoIsTheWinner();
    console.log("is a Black Jack");
  } else if (resultDealer === 21 && playerPoints.textContent !== 21) {
    playerHand.dataset.turn = false;
    dealerHand.dataset.turn = false;
    playerStand.dataset.start = false;

    getSecondCardFromDealer(false, true);
    calculatePointsAndPrintThem();
    whoIsTheWinner();
    console.log("is a Black Jack");
  }
};

const isPlayerPoints21 = (deckRandom) => {
  if (resultPlayer === 21) {
    getSecondCardFromDealer(false, true);
    calculatePointsAndPrintThem();
    dealerReachedMaxHit(deckRandom);

    console.log("is Player Points 21");
  }
};

const whoIsTheWinner = () => {
  if (resultDealer > resultPlayer && resultDealer <= 21) {
    message.textContent += " Dealer Wins";
    dealerScore += 1;
    console.log(dealerScore);
    console.log("Dealer wins");
    printTheScore();
  }
  if (resultPlayer > resultDealer && resultPlayer <= 21) {
    message.textContent += " Player Wins";
    playerScore += 1;
    console.log("Player wins");
    printTheScore();
  }
  if (resultDealer === resultPlayer) {
    message.textContent += "Push";
    console.log("Push");
  }
};

function printTheScore() {
  playerScoreDisplay.innerText = playerScore;
  dealerScoreDisplay.innerText = dealerScore;
}

const resetGame = () => {
  const dealButton = document.getElementById("deal-button");
  const playerCardsToRemove = getPlayerHandCards();
  const dealerCardsToRemove = getDealerHandCards();
  dealerCardsToRemove.forEach((card) => {
    card.remove();
  });
  playerCardsToRemove.forEach((card) => {
    card.remove();
  });
  message.textContent = "";
  dealerPoints.textContent = 0;
  playerPoints.textContent = 0;
  dealButton.dataset.start = true;
  delete dealerHand.dataset.start;
  delete dealerHand.dataset.turn;
  delete playerHand.dataset.turn;
  playerStand.dataset.start = true;
  hitButton.dataset.start = false;
  resultDealer = 0;
  resultPlayer = 0;
};


document.addEventListener("click", handleClick);

window.addEventListener("DOMContentLoaded", () => {
  playerPoints.textContent = resultPlayer;
  dealerPoints.textContent = resultDealer;
  playerScoreDisplay.innerText = playerScore;
  dealerScoreDisplay.innerText = dealerScore;
});

// Need to reset waiting few seconds
// delete the button resset
// Add Money to bet
