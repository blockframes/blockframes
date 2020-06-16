import { Directive, Input, HostBinding, NgModule, ElementRef, Optional, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, BehaviorSubject, Subscription, of, Observable } from 'rxjs';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

interface LayoutGrid {
  columns: number;
  gutter: number;
  margin: number;
}

function getLayoutGrid(width: number): LayoutGrid {
  if (width < 599) {
    return { columns: 4, gutter: 16, margin: 16 };  // xs
  } else if (width < 1023) {
    return { columns: 8, gutter: 16, margin: 16 };  // sm
  } else if (width < 1439) {
    return { columns: 12, gutter: 24, margin: 24 }; // md
  } else if (width < 1919) {
    return { columns: 12, gutter: 24, margin: 24 }; // lg
  } else {
    return { columns: 12, gutter: 24, margin: 24 }; // xl
  }
}


@Directive({ selector: '[layout]' })
// tslint:disable-next-line: directive-class-suffix
export class Layout implements OnInit, OnDestroy {
  private observer;
  public width: BehaviorSubject<number>;
  public layout$: Observable<LayoutGrid>;

  constructor(private el: ElementRef) { }

  async ngOnInit() {
    const el = this.el.nativeElement;
    const ResizeObserver = (window as any).ResizeObserver || (await import('@juggle/resize-observer')).ResizeObserver;
    this.observer = new ResizeObserver(([entry]) => this.width.next(entry.contentRect.width));
    this.observer.observe(el);
    this.width = new BehaviorSubject<number>(this.el.nativeElement.clientWidth);
    this.layout$ = this.width.asObservable().pipe(
      map(width => getLayoutGrid(width)),
      distinctUntilChanged((a, b) => a.columns === b.columns && a.gutter === b.gutter && a.margin === b.margin),
      shareReplay(1)
    );
  }

  ngOnDestroy() {
    this.observer.unobserve(this.el.nativeElement);
  }
}


@Directive({
  selector: '[grid]',
  host: { class: 'mat-grid' },
})
// tslint:disable-next-line: directive-class-suffix
export class Grid implements OnInit, OnDestroy {
  private sub: Subscription;

  @HostBinding('style.display') display = 'grid';
  @HostBinding('style.gridTemplateColumns') columns: string;
  @HostBinding('style.columnGap')
  @HostBinding('style.rowGap')
  gutters: string;

  @HostBinding('style.margin')
  margin: string;

  constructor(private layout: Layout) { }

  ngOnInit() {
    this.sub = this.layout.layout$.subscribe(({ margin, columns, gutter }) => {
      this.columns = `repeat(${columns}, 1fr)`;
      this.gutters = `${gutter}px`;
      this.margin = `${margin}px`;
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

@Directive({
  selector: '[flex]',
  host: { class: 'mat-flex' }
})
// tslint:disable-next-line: directive-class-suffix
export class Flex implements OnInit, OnDestroy {
  private sub: Subscription;

  @HostBinding('style.marginRight')
  @HostBinding('style.marginLeft')
  margin: string;

  private _margin: number;

  constructor(private layout: Layout) { }

  /* Use this function if you need the number value of calculation */
  marginOffset() {
    if (this._margin === undefined) {
      return 0;
    }
    return this._margin;
  }

  ngOnInit() {
    this.sub = this.layout.layout$.subscribe(({ margin, columns, gutter }) => {
      this._margin = margin
      this.margin = `${margin}px`;
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

// TODO: divide those directives into tow

@Directive({ selector: '[col]' })
// tslint:disable-next-line: directive-class-suffix
export class Column implements OnInit, OnDestroy {
  private sub: Subscription;
  private _col = new BehaviorSubject(0);

  // Grid
  @HostBinding('style.gridColumn') gridColumns: string;

  // Flex
  @HostBinding('style.width') width;
  @HostBinding('style.marginRight') marginRight: string;


  @Input()
  set col(column: number) {
    this._col.next(column);
  }

  constructor(
    @Optional() private grid: Grid,
    @Optional() private flex: Flex,
    private layout: Layout,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.sub = combineLatest([
      this.layout.layout$,
      this._col.asObservable()
    ]).subscribe(([grid, column]) => {
      if (this.grid) {
        this.gridColumns = `span ${column}`;
      }
      if (this.flex) {
        const ratio = column / grid.columns;
        const allGutters = (grid.columns - 1) * grid.gutter;
        const innerGutter = (column - 1) * grid.gutter;
        this.width = this.sanitizer.bypassSecurityTrustStyle(`calc(${ratio} * (100% - ${allGutters}px) + ${innerGutter}px)`);
        this.marginRight = `${grid.gutter}px`;
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

@NgModule({
  exports: [Layout, Grid, Flex, Column],
  declarations: [Layout, Grid, Flex, Column],
})
export class MatLayoutModule { }
