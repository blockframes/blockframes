
export class BucketMocked {

  public name: string;
  public files = {};

  constructor(name: string) {
    this.name = name;
  }

  getFiles(prefix: string) {
    return new Promise((resolve) => {
      resolve([this.files[prefix] || []]);
    });
  }
}

export class StorageMocked {

  bucket(name: string) {
    return new BucketMocked(name);
  }
}