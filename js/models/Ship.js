export class Ship {
    constructor(name, size) {
      this.name = name;
      this.size = size;
      this.hits = 0;
    }
    
    isSunk() {
      return this.hits >= this.size;
    }
  }