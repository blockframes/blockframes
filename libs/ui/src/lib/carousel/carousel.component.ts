// Angular
import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  Directive,
  HostBinding,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import { CdkScrollable } from '@angular/cdk/overlay';

// RxJs
import { map, distinctUntilChanged, startWith, tap, debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Component({
  selector: 'bf-carousel',
  templateUrl: 'carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class CarouselComponent implements AfterViewInit {

  public currentPosition: number;

  // Indicators to show arrow buttons
  public showBack: Observable<boolean>;
  public showForward: Observable<boolean>;

  @ViewChild(CdkScrollable) scrollable: CdkScrollable;
  @ViewChild('container') container: ElementRef<HTMLDivElement>;

  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.showBack = this.onScrolling('left');
    this.showForward = this.onScrolling('right');
    this.cdr.detectChanges()
  }

  scrollTo(direction: 'left' | 'right') {
    this.currentPosition = this.scrollable.measureScrollOffset('left');
    const clientWidth = this.container.nativeElement.clientWidth

    direction === 'right'
      ? this.scrollable.scrollTo({ left: this.currentPosition + clientWidth })
      : this.scrollable.scrollTo({ left: this.currentPosition - clientWidth })
  }

  onScrolling(direction: 'right' | 'left') {
    return this.scrollable.elementScrolled().pipe(
      debounceTime(50),
      map(_ => !!this.scrollable.measureScrollOffset(direction)),
      distinctUntilChanged(),
      tap(_ => this.cdr.detectChanges()),
      startWith(direction === 'right' ? true : false),
    )
  }
}

@Directive({ selector: '[carouselItem]' })
export class CarouselItemDirective {
  @HostBinding('style.flexShrink') shrink = 0;
}