export class Paper {
    constructor({
      title,
      authors,
      publication_date,
      citations,
      link,
      abstract,
      figures = [],
      isQueried = false
    }) {
      this.title = title;
      this.authors = authors;
      this.publication_date = publication_date;
      this.citations = citations;
      this.link = link;
      this.abstract = abstract;
      this.figures = figures;
      this.isQueried = isQueried;
    }
  }
  