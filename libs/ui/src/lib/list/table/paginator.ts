import { BehaviorSubject } from 'rxjs';

interface PageState {
  pageSize: number;
  pageIndex: number;
}

export class Paginator {
  size$ = new BehaviorSubject(0);
  state = new BehaviorSubject({
    pageSize: 0,
    pageIndex: 0, 
  });

  private setState(state: Partial<PageState>) {
    this.state.next({ ...this.state.getValue(), ...state});
  }

  get size() {
    return this.size$.getValue();
  }
  set size(size: number) {
    this.size$.next(size);
  }

  get pageSize() {
    return this.state.getValue().pageSize;
  }
  set pageSize(pageSize: number) {
    this.setState({ pageSize });
  }

  get pageIndex() {
    return this.state.getValue().pageIndex;
  }
  set pageIndex(pageIndex: number) {
    this.setState({ pageIndex });
  }

  get maxIndex() {
    return Math.floor(this.size / this.pageSize);
  }

  next() {
    const currentPage = this.pageIndex;
    if (currentPage < this.maxIndex) {
      this.pageIndex = currentPage + 1;
    }
  }

  last() {
    this.pageIndex = this.maxIndex;
  }

  previous() {
    const currentPage = this.pageIndex;
    if (currentPage !== 0) {
      this.pageIndex = currentPage - 1;
    }
  }

  first() {
    this.pageIndex = 0;
  }
}