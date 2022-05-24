// Angular
import {
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  Directive,
  HostBinding,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  NgZone,
  OnDestroy,
  ContentChildren,
  QueryList,
  Input,
  AfterContentInit,
  TemplateRef
} from '@angular/core';
import { CdkScrollable } from '@angular/cdk/overlay';

// Blockframes
import { getLayoutGrid } from '../layout/layout.module';

// RxJs
import { Observable, Subscription } from 'rxjs';
import { startWith, distinctUntilChanged, map, debounceTime, tap } from 'rxjs/operators';


@Directive({ selector: '[carouselItem]' })
export class CarouselItemDirective {
  @HostBinding('style.flexShrink') shrink = 0;

  constructor(public template: TemplateRef<unknown>) {}
}

@Component({
  selector: 'bf-carousel',
  templateUrl: 'carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent implements AfterViewInit, AfterContentInit, OnDestroy {
  @HostBinding('attr.data-columns') _columns: number = 0;


  /* Indicators to show arrow buttons */
  min = 0;
  public showForward: boolean;
  public showBack: boolean;
  public amount$: Observable<number>;

  private subRight: Subscription;
  private subLeft: Subscription;
  private itemsSub: Subscription;

  private currentPosition: number;

  @ViewChild(CdkScrollable) scrollable: CdkScrollable;
  @ViewChild('container') container: ElementRef<HTMLDivElement>;
  @ContentChildren(CarouselItemDirective) items: QueryList<CarouselItemDirective>;

  @Input() set columns(columns: 2 | 3 | 4 | 5 | 6) {
    this._columns = columns;
  }

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  get carouselWidth() {
    return this.elementRef.nativeElement.clientWidth
  }

  get clientWidth() {
    return this.container.nativeElement.clientWidth;
  }

  ngAfterViewInit() {
    this.subLeft = this.onScrolling('left').subscribe(showBack => {
      this.showBack = showBack;
      this.ngZone.run(() => this.cdr.detectChanges())
    })

    this.subRight = this.onScrolling('right').subscribe(showForward => {
      this.showForward = showForward;
      this.ngZone.run(() => this.cdr.detectChanges())
    })
  }

  ngAfterContentInit() {
    this.amount$ = this.items.changes.pipe(startWith(this.items), map(items => items.length));
    this.itemsSub = this.items.changes.subscribe(items => {
      this.showForward = items.length > this._columns;
      this.cdr.markForCheck();
    });

    const { columns } = getLayoutGrid(this.carouselWidth);
    const col = 12 / this._columns // number of columns in 12 column grid
    this.min = this._columns ? Math.floor(columns / col) : 0;
  }

  scrollTo(direction: 'left' | 'right') {
    this.currentPosition = this.scrollable.measureScrollOffset('left');

    direction === 'right'
      ? this.scrollable.scrollTo({ left: this.currentPosition + this.clientWidth })
      : this.scrollable.scrollTo({ left: this.currentPosition - this.clientWidth })
  }

  onScrolling(direction: 'right' | 'left') {
    return this.scrollable.elementScrolled().pipe(
      debounceTime(50),
      distinctUntilChanged(),
      startWith(direction === 'right'),
      // offset can have tiny numbers when visually it is 0 - therefore we check if the offset is small enough to hide buttons
      map(() => this.scrollable.measureScrollOffset(direction) > 3),
      tap(() => this.ngZone.run(() => this.cdr.detectChanges())))
  }

  ngOnDestroy() {
    if (this.subLeft) this.subLeft.unsubscribe();
    if (this.subRight) this.subRight.unsubscribe();
    if (this.itemsSub) this.itemsSub.unsubscribe();
  }
}
