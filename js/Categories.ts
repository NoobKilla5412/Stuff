class Categories {
  public static main(): void {
    var allAnswers: {
      [category: string]: string[];
    } = {};
    for (let i = 0; i < 3; i++) {
      const category = prompt("Enter a category: ");
      if (category == null) return;
      var answers = [];
      for (let a = 0; a < 3; a++) {
        var answer = prompt("Enter something in the category " + category + ": ");
        if (answer == null) return;
        answers.push(answer);
      }
      alert(category + ": " + answers.join(" "));
      allAnswers[category] = answers;
    }
    for (const key in allAnswers) {
      if (Object.prototype.hasOwnProperty.call(allAnswers, key)) {
        const element = allAnswers[key];
        document.write(`<h2>${key}</h2>Answers: ${element.join(", ")}`);
      }
    }
  }
}
