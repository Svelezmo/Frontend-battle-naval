class Player {
    constructor(name, countryCode, isHuman = true) {
      this.name = name;
      this.countryCode = countryCode;
      this.isHuman = isHuman;
      this.score = 0;
    }
  }