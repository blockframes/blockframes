export class Queue {
  content: string[] = [];

  push(x: string) {
    this.content.push(x);
  }

  pop(): string {
    const x = this.content.shift();

    if (x === undefined) {
      throw new Error('popping from an empty queue');
    } else {
      return x;
    }
  }

  isEmpty(): boolean {
    return this.content.length === 0;
  }
}
