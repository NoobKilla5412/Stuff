class Question<Type extends keyof QuestionTypes> {
  public question: string;
  public type?: Type;
  public options?: QuestionTypes[Type];
  public answer: string;
  public text?: string;
  public link?: string;

  public constructor(
    type: Type,
    question: string,
    answer: string,
    options?: QuestionTypes[Type],
    text?: string,
    link?: string
  ) {
    this.type = type;
    this.question = question;
    this.answer = answer;
    this.options = options;
    this.text = text;
    this.link = link;
  }
}

interface QuestionTypes {
  link: defaultLinkOptions;
  ol: defaultOlOptions;
  p: defaultPOptions;
  text: defaultTextOptions;
  ul: defaultUlOptions;
}
