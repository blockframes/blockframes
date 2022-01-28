const bucketFiles = {};

export class MockedGFile {
  public name: string;
  public prefix: string;

  constructor(name: string, prefix: string) {
    this.name = `${prefix}/${name}`;
    this.prefix = `${prefix}/`;
    if (!bucketFiles[this.prefix]) {
      bucketFiles[this.prefix] = [];
    }
    bucketFiles[this.prefix].push(this);
  }

  delete() {
    return new Promise((resolve) => {
      bucketFiles[this.prefix] = bucketFiles[this.prefix].filter(f => f.name !== this.name);
      resolve(true);
    });
  }
}

export class BucketMocked {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  populate(files: string[], prefix) {
    files.forEach(name => new MockedGFile(name, prefix));
  }

  getFiles(options: { prefix: string }) {
    return new Promise((resolve) => {
      resolve([bucketFiles[options.prefix] || []]);
    });
  }
}

export class StorageMocked {
  bucket(name: string) {
    return new BucketMocked(name);
  }
}
