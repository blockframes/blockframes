
export abstract class StateListGuard {
  protected listenOnList = false;

  abstract startListeningOnList(): void;

  public stopListeningOnList() {
    this.listenOnList = false;
  }
}


export abstract class StateActiveGuard {
  protected listenOnActive = false;

  abstract startListeningOnActive(...params: any[]): void;

  public stopListeningOnActive() {
    this.listenOnActive = false;
  }
}