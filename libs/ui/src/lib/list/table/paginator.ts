import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PageState {
  pageSize: number;
  pageIndex: number;
}

interface PaginatorConfig {
  onChange: (paginator: PageState) => void
}

export class Paginator {
  size$ = new BehaviorSubject(0);
  state = new BehaviorSubject({
    pageSize: 0,
    pageIndex: 0,
  });
  shouldDisplay$ = combineLatest([
    this.size$,
    this.state,
  ]).pipe(
    map(([size, state]) => state.pageSize && size > state.pageSize)
  );

  onChange: () => void;

  constructor(config: PaginatorConfig) {
    this.onChange = () => config.onChange(this.getState());
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
    if (this.pageSize < 1) return this.size - 1; // Max 1 row/page
    const pageCount = Math.ceil(this.size / this.pageSize);
    return pageCount ? pageCount - 1 : pageCount;
  }

  private setState(state: Partial<PageState>) {
    this.state.next({ ...this.state.getValue(), ...state });
    this.onChange();
  }

  getState() {
    return this.state.getValue();
  }

  next() {
    const currentPage = this.pageIndex;
    if (currentPage < this.maxIndex) {
      this.pageIndex = currentPage + 1;
      this.onChange();
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
