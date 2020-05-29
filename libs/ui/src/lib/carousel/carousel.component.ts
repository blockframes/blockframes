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
import { Observable, Subscription } from 'rxjs';
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

  private showBack$: Observable<boolean>;
  private showForward$: Observable<boolean>;

  private subBack: Subscription;
  private subForward: Subscription;

  private currentPosition: number;

  @ViewChild(CdkScrollable) scrollable: CdkScrollable;
  @ViewChild('container') container: ElementRef<HTMLDivElement>;

  constructor(private flex: Flex, private cdr: ChangeDetectorRef, private ngZone: NgZone) { }

  get clientWidth() {
    return this.container.nativeElement.clientWidth;
  }

  ngAfterViewInit() {
    this.showBack$ = this.onScrolling('left');
    this.showForward$ = this.onScrolling('right');

    this.subBack = this.showForward$.subscribe(value => {
      this.showForward = value;
      this.cdr.detectChanges();
    })

    this.subForward = this.showBack$.subscribe(value => {
      this.showBack = value;
      this.cdr.detectChanges();
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
    if (this.subBack) this.subBack.unsubscribe();
    if (this.subForward) this.subForward.unsubscribe();
  }
}

@Directive({ selector: '[carouselItem]' })
export class CarouselItemDirective {
  @HostBinding('style.flexShrink') shrink = 0;
}