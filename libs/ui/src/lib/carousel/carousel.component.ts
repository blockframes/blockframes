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
import { startWith, distinctUntilChanged, map, debounceTime, tap } from 'rxjs/operators';


@Component({
  selector: 'bf-carousel',
  templateUrl: 'carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent implements AfterViewInit {

  public currentPosition: number;

  /* Indicators to show arrow buttons */
  public showBack$: Observable<boolean>;
  public showForward$: Observable<boolean>;

  @ViewChild(CdkScrollable) scrollable: CdkScrollable;
  @ViewChild('container') container: ElementRef<HTMLDivElement>;

  constructor(private flex: Flex, private cdr: ChangeDetectorRef, private ngZone: NgZone) { }

  get clientWidth() {
    return this.container.nativeElement.clientWidth;
  }


  ngAfterViewInit() {
    this.showBack$ = this.onScrolling('left');
    this.showForward$ = this.onScrolling('right')
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
      tap(_ => this.ngZone.runOutsideAngular(() => {
        console.log('run')
        this.cdr.detectChanges()
      }
      )))
  }
}

@Directive({ selector: '[carouselItem]' })
export class CarouselItemDirective {
  @HostBinding('style.flexShrink') shrink = 0;
}