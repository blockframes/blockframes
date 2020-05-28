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
} from '@angular/core';
import { CdkScrollable } from '@angular/cdk/overlay';

// Layout
import { Flex } from '../layout/layout.module';

// RxJs
import { Observable } from 'rxjs';
import { startWith, tap, distinctUntilChanged, map, debounceTime } from 'rxjs/operators';


@Component({
  selector: 'bf-carousel',
  templateUrl: 'carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})  // TODO #2835
export class CarouselComponent /* implements AfterViewInit */ {

  public currentPosition: number;

  /* Indicators to show arrow buttons */
  public showBack: Observable<boolean>;
  public showForward: Observable<boolean>;


  @ViewChild(CdkScrollable) scrollable: CdkScrollable;
  @ViewChild('container') container: ElementRef<HTMLDivElement>;

  public scroll;
  constructor(private flex: Flex, private cdr: ChangeDetectorRef, private ngZone: NgZone) { }

  get clientWidth() {
    return this.container.nativeElement.clientWidth;
  }

  /* TODO #2835 */
 /*  ngAfterViewInit() {
    this.showBack = this.onScrolling('left'); */
    /* If clientWidth is smaller or equal to scrollWidth, it means we got an overflow */
  /*   if (this.clientWidth <= this.container.nativeElement.scrollWidth) {
      this.showForward = this.onScrolling('right')
    }
    this.scroll =  this.scrollable.elementScrolled();
  } */

  scrollTo(direction: 'left' | 'right') {
    this.currentPosition = this.scrollable.measureScrollOffset('left');
    const clientWidth = this.clientWidth

    direction === 'right'
      ? this.scrollable.scrollTo({ left: this.currentPosition + clientWidth + this.flex.marginOffset() })
      : this.scrollable.scrollTo({ left: this.currentPosition - clientWidth - this.flex.marginOffset() })
  }

  // TODO #2835
/*   onScrolling(direction: 'right' | 'left') {
    return this.scrollable.elementScrolled().pipe(
      debounceTime(50),
      map(_ => !!this.scrollable.measureScrollOffset(direction)),
      distinctUntilChanged(),
      tap(_ => this.ngZone.run(() => this.cdr.detectChanges())),
      startWith(direction === 'right'),
    )
  } */
}

@Directive({ selector: '[carouselItem]' })
export class CarouselItemDirective {
  @HostBinding('style.flexShrink') shrink = 0;
}