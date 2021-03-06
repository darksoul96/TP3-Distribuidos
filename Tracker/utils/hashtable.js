class HashTable {
  constructor() {
    this.table = new Array(127);
    this.size = 0;
    this.domain = [0, 127];
  }

  _hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash += key.charCodeAt(i);
    }
    return hash % this.table.length;
  }

  setDomain(start, end) {
    this.domain = [start, end];
  }

  set(key, value) {
    const index = this._hash(key);
    if (index >= this.domain[0] && index < this.domain[1]) {
      this.table[index] = [key, value];
      this.size++;
      return true;
    } else {
      return false;
    }
  }

  get(key) {
    const target = this._hash(key);
    return this.table[target];
  }

  remove(key) {
    const index = this._hash(key);

    if (this.table[index] && this.table[index].length) {
      this.table[index] = [];
      this.size--;
      return true;
    } else {
      return false;
    }
  }

  list() {
    if (this.size > 0) return this.table;
    else return false;
  }

  getSize() {
    return this.size;
  }

  setSize(size) {
    this.size = size;
  }

  loadTable(array, size) {
    if (size <= 127) {
      this.size = size;
      this.table = array;
    }
  }

  getTable() {
    return this.table;
  }
}

module.exports = new HashTable();
