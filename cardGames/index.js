// @ts-check

function log(x) {
  if (x === undefined) document.body.innerHTML += "undefined";
  else if (x === null) document.body.innerHTML += "null";
  else document.body.innerHTML += JSON.stringify(x, undefined, 2)?.replace(/</g, "&lt;");
  return x;
}

const cardBack = `<div class="card" style="background-color: gray"></div>`;
const emptyCard = `<div class="card"></div>`;
const cardBackInline = `<div class="card" style="display: inline-block" style="background-color: gray"></div>`;
const emptyCardInline = `<div class="card" style="display: inline-block"></div>`;

class Card {
  suit = "hearts";
  number = 1;

  constructor(number = 1, suit = "hearts") {
    this.number = number;
    this.suit = suit;
  }

  toString(block = true) {
    let num = this.number.toString();
    let suit = this.suit;
    switch (num) {
      case "1":
        num = "ace";
        break;
      case "11":
        num = "jack";
        break;
      case "12":
        num = "queen";
        break;
      case "13":
        num = "king";
        break;
      case "14":
        num = "";
        if (suit == "hearts" || suit == "diamonds") {
          suit = "joker_red";
        } else {
          suit = "joker_black";
        }
        break;
    }
    return `<img class="card" ${
      block ? `style="display: block"` : `style="display: inline-block"`
    } src="https://tekeye.uk/playing_cards/images/svg_playing_cards/fronts/${suit}${num ? "_" + num : ""}.svg" />`;
  }
}

class CardStack {
  /** @type {Card[]} */
  cards = [];
  faceUp = false;

  /**
   * @param {boolean} faceUp
   */
  constructor(faceUp = false) {
    this.faceUp = faceUp;
  }

  /**
   * @param {...Card} cards
   */
  add(...cards) {
    this.cards.unshift(...cards);
  }

  /**
   * @param {...Card} cards
   */
  addBottom(...cards) {
    this.cards.push(...cards);
  }

  /**
   * @overload
   * @returns {Card | undefined}
   */
  /**
   * @overload
   * @param {number} amount
   * @returns {Card[]}
   */
  draw(amount = 1) {
    if (amount == 1) return this.cards.shift();
    else {
      let cards = [];
      while (amount > 0) {
        cards.unshift(this.cards.shift());
        amount--;
      }
      return cards;
    }
  }

  /**
   * @overload
   * @returns {Card | undefined}
   */
  /**
   * @overload
   * @param {number} amount
   * @returns {Card[]}
   */
  drawBottom(amount) {
    if (amount == undefined) return this.cards.pop();
    else {
      let cards = [];
      while (amount > 0) {
        cards.unshift(this.cards.pop());
        amount--;
      }
      return cards;
    }
  }

  shuffle() {
    this.cards.sort(() => Math.random() - 0.5);
    this.cards.sort(() => Math.random() - 0.5);
    this.cards.sort(() => Math.random() - 0.5);
  }

  toString() {
    return this.faceUp ? this.cards[0]?.toString() ?? emptyCard : cardBack;
  }
}

class Hand {
  /**
   * @type {Card[]}
   */
  cards = [];

  /**
   * @param  {...Card} cards
   */
  addLeft(...cards) {
    this.cards.unshift(...cards);
  }

  /**
   * @param  {...Card} cards
   */
  addRight(...cards) {
    this.cards.push(...cards);
  }

  toString() {
    return `<div>${this.cards.map((card) => card.toString(false))}</div>`;
  }
}

const suits = ["spades", "diamonds", "clubs", "hearts"];

function Deck(faceUp = false, shuffled = true) {
  let cards = new CardStack(faceUp);

  for (const suit of suits) {
    for (let i = 1; i <= 13; i++) {
      cards.addBottom(new Card(i, suit));
    }
  }

  if (shuffled) cards.shuffle();

  return cards;
}
