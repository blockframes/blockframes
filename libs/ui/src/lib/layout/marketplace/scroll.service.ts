import { CdkScrollable } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollService {

  public scrollable: CdkScrollable
  private offset: number;

  constructor() { }

  set() {
    this.offset = this.scrollable.measureScrollOffset('top');
  }

  go() {
    this.scrollable.scrollTo({ top: this.offset });
  }
}
