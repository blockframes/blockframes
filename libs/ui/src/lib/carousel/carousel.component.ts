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
} from '@angular/core';
import { CdkScrollable } from '@angular/cdk/overlay';

// Layout
import { Flex } from '../layout/layout.module';

// RxJs
import { Subscription } from 'rxjs';
import { startWith, distinctUntilChanged, map, debounceTime, tap } from 'rxjs/operators';


@Component({
  selector: 'bf-carousel',
  templateUrl: 'carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent implements AfterViewInit, OnDestroy {

  /* Indicators to show arrow buttons */
  public showForward: boolean;
  public showBack: boolean;

  private subRight: Subscription;
  private subLeft: Subscription;

  private currentPosition: number;

  @ViewChild(CdkScrollable) scrollable: CdkScrollable;
  @ViewChild('container') container: ElementRef<HTMLDivElement>;

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
      map(_ => !!this.scrollable.measureScrollOffset(direction)),
      distinctUntilChanged(),
      startWith(direction === 'right'),
      tap(_ => this.ngZone.run(() => this.cdr.detectChanges())))
  }

  ngOnDestroy() {
    if (this.subLeft) this.subLeft.unsubscribe();
    if (this.subRight) this.subRight.unsubscribe();
  }
}

@Directive({ selector: '[carouselItem]' })
export class CarouselItemDirective {
  @HostBinding('style.flexShrink') shrink = 0;
}