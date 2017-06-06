export class Node {
  constructor(children, x, y, id) {
    this.children = children;
    this.x = x;
    this.y = y;
    this.id = id;
  }
}

export const NODELIST = {
  1: new Node([{ id: 2, weight: 10 }, { id: 3, weight: 5 }], 20, 20, 1),
  2: new Node([{ id: 5, weight: 4 }], 40, 10, 2),
  3: new Node([{ id: 5, weight: 5 }, { id: 4, weight: 7 }], 40, 30, 3),
  4: new Node([{ id: 6, weight: 9 }], 60, 30, 4),
  5: new Node([{ id: 6, weight: 2 }], 60, 10, 5),
  6: new Node([{}], 80, 20, 6)
}

export const NODELIST2 = {
  1: new Node([
    { id: 2, weight: 11 },
    { id: 4, weight: 9 },
    { id: 5, weight: 8 },
  ], 20, 20, 1),
  2: new Node([{ id: 3, weight: 8 }, { id: 7, weight: 8 }], 40, 10, 2),
  3: new Node([{ id: 7, weight: -7 }], 40, 30, 3),
  4: new Node([
    { id: 5, weight: -15 },
    { id: 6, weight: 1 },
    { id: 2, weight: 3 },
  ], 60, 30, 4),
  5: new Node([{ id: 6, weight: 10 }], 60, 10, 5),
  6: new Node([{ id: 8, weight: 2 }], 80, 20, 6),
  7: new Node([{ id: 4, weight: 12 }, { id: 8, weight: 5 }], 80, 20, 7),
  8: new Node([{ id: 3, weight: 4 }], 80, 20, 8)
}