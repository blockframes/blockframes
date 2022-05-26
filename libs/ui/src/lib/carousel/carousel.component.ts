// Angular
import {
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  Directive,
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

// RxJs
import { Subscription } from 'rxjs';
import { startWith, distinctUntilChanged, map, debounceTime, tap } from 'rxjs/operators';

interface Columns {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;

  gtXs: number;
  gtSm: number;
  gtMd: number;

  ltMd: number;
  ltLg: number;
  ltXl: number;
}

const sizes: Record<string, string[]> = {
  xs: ['xs'],
  sm: ['sm'],
  md: ['md'],
  lg: ['lg'],
  xl: ['xl'],

  gtXs: ['sm', 'md', 'lg', 'xl'],
  gtSm: ['md', 'lg', 'xl'],
  gtMd: ['lg', 'xl'],

  ltMd: ['xs', 'sm'],
  ltLg: ['xs', 'sm', 'md'],
  ltXl: ['xs', 'sm', 'md', 'lg']
}


@Directive({ selector: '[carouselItem]' })
export class CarouselItemDirective {
  constructor(public template: TemplateRef<unknown>) {}
}

@Component({
  selector: 'bf-carousel',
  templateUrl: 'carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent implements AfterViewInit, AfterContentInit, OnDestroy {

  /* Indicators to show arrow buttons */
  public showForward: boolean;
  public showBack: boolean;

  private subRight: Subscription;
  private subLeft: Subscription;
  private itemsSub: Subscription;

  private currentPosition: number;

  @ViewChild(CdkScrollable) scrollable: CdkScrollable;
  @ContentChildren(CarouselItemDirective) items: QueryList<CarouselItemDirective>;

  @Input() set columns(amount: Partial<Columns> | string) {
    if (!amount) return;

    if (typeof amount === 'object') {
      for (const [size, value] of Object.entries(amount)) {
        sizes[size]?.forEach(label => this.el.nativeElement.style.setProperty(`--${label}-columns`, value));
      }
    } else {
      this.el.nativeElement.style.setProperty('--columns', amount)
    }
  }

  constructor(
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  get carouselWidth() {
    return this.el.nativeElement.clientWidth
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
    this.itemsSub = this.items.changes.subscribe(() => {
      this.showForward = !!this.scrollable.measureScrollOffset('right')
      this.cdr.markForCheck();
    });
  }

  scrollTo(direction: 'left' | 'right') {
    this.currentPosition = this.scrollable.measureScrollOffset('left');

    direction === 'right'
      ? this.scrollable.scrollTo({ left: this.currentPosition + this.carouselWidth })
      : this.scrollable.scrollTo({ left: this.currentPosition - this.carouselWidth })
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
