try {
  let cards = Deck(true, true);

  let hand = new Hand();

  hand.addLeft(...cards.drawBottom(13));
  // hand.addLeft(...cards.drawBottom(1));

  // log(cards);

  // log(cards.toString());
  document.body.innerHTML += cards.toString();
  document.body.innerHTML += hand.toString();
} catch (e) {
  document.body.innerHTML += e.stack;
}
