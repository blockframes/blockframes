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
  QueryList, Input, AfterContentInit
} from '@angular/core';
import { CdkScrollable } from '@angular/cdk/overlay';

// Layout
import { Flex } from '../layout/layout.module';

// RxJs
import { Observable, Subscription } from 'rxjs';
import { startWith, distinctUntilChanged, map, debounceTime, tap } from 'rxjs/operators';


@Directive({ selector: '[carouselItem]' })
export class CarouselItemDirective {
  @HostBinding('style.flexShrink') shrink = 0;
}

@Component({
  selector: 'bf-carousel',
  templateUrl: 'carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent implements AfterViewInit, AfterContentInit, OnDestroy {

  @Input() min: number;

  /* Indicators to show arrow buttons */
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

  constructor(private flex: Flex, private cdr: ChangeDetectorRef, private ngZone: NgZone) { }

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
    this.itemsSub = this.items.changes.subscribe(_ => this.showForward = !!this.scrollable.measureScrollOffset('right'));
  }

  scrollTo(direction: 'left' | 'right') {
    this.currentPosition = this.scrollable.measureScrollOffset('left');
    const clientWidth = this.clientWidth

    direction === 'right'
      ? this.scrollable.scrollTo({ left: this.currentPosition + clientWidth + this.flex.marginOffset() })
      : this.scrollable.scrollTo({ left: this.currentPosition - clientWidth - this.flex.marginOffset() })
  }

  onScrolling(direction: 'right' | 'left') {
    return this.scrollable.elementScrolled().pipe(
      debounceTime(50),
      distinctUntilChanged(),
      startWith(direction === 'right'),
      // offset can have tiny numbers when visually it is 0 - therefore we check if the offset is small enough to hide buttons
      map(_ => this.scrollable.measureScrollOffset(direction) > 3),
      tap(_ => console.log("123", _)),
      tap(_ => this.ngZone.run(() => this.cdr.detectChanges())))
  }

  ngOnDestroy() {
    if (this.subLeft) this.subLeft.unsubscribe();
    if (this.subRight) this.subRight.unsubscribe();
    if (this.itemsSub) this.itemsSub.unsubscribe();
  }
}
