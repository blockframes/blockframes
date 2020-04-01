// RxJs
import { takeUntil, filter } from 'rxjs/operators';
import { Subject, BehaviorSubject, Observable, interval } from 'rxjs';

// Custom
import { SlideComponent } from './slide/slide.component';
import { ThemeService } from '@blockframes/ui/theme';
import { Slider } from './slider.interface';

// Angular
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  OnDestroy,
  AfterContentInit,
  QueryList,
  ContentChildren,
  ElementRef,
  AfterViewInit,
  ViewChild,
  Renderer2,
  Inject,
  PLATFORM_ID,
  HostListener
} from '@angular/core';
import { AnimationBuilder, animate, style } from '@angular/animations';
import { ListKeyManager } from '@angular/cdk/a11y';
import { isPlatformBrowser } from '@angular/common';

enum Direction {
  Left,
  Right,
  Index
}

@Component({
  selector: 'bf-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit, Slider {

  //////////////////
  // Public Vars //
  ////////////////

  public theme: string;

  public listKeyManager: ListKeyManager<SlideComponent>;

  /////////////
  // Inputs //
  ///////////

  @Input() timing: Slider['timing'] = '250ms ease-in';

  @Input() interval: Slider['interval'] = 3;

  @Input() hideArrows: Slider['hideArrows'] = false;

  @Input() ratio: Slider['ratio'] = '16:9';

  @Input() hideIndicators: Slider['hideIndicators'] = false;

  @Input() arrowBack: Slider['arrowBack'] = 'arrow_back';

  @Input() arrowForward: Slider['arrowForward'] = 'arrow_forward'

  @Input()
  get slideDirection() { return this._slideDirection }
  set slideDirection(value: Slider['slideDirection']) {
    this.slideDirection$.next(value);
    this._slideDirection = value;
  }

  @Input()
  get maxWidth() { return this._maxWidth }
  set maxWidth(value: string) {
    this._maxWidth = value;
    this.maxWidth$.next();
  }

  @Input()
  get swipe() {
    return this._swipe;
  }
  set swipe(value) {
    this._swipe = value
  }

  @Input()
  get loop() {
    return this._loop;
  }
  set loop(value) {
    this._loop = value
  }

  @Input()
  get autoplay() {
    return this._autoplay
  }
  set autoplay(value) {
    this._autoplay = coerceBooleanProperty(value)
  }

  ///////////////////
  // Private Vars //
  /////////////////

  private _swipe: Slider['swipe'];

  private _autoplay: Slider['autoplay'];
  private autoplay$ = new Subject<boolean>();

  private _loop: Slider['loop'];
  private loop$ = new Subject<boolean>();

  private interval$ = new BehaviorSubject<number>(5000);

  private slides$ = new BehaviorSubject<number>(null);

  private timer$: Observable<number>;
  private timerStop$ = new Subject<never>();

  private _maxWidth = 'auto';
  private maxWidth$ = new Subject<never>();

  private _slideDirection: Slider['slideDirection'] = 'ltr';
  private slideDirection$ = new Subject<Slider['slideDirection']>();

  // Cancels all the subscription
  private destroy$ = new Subject<never>();

  // Flag to indicate if animation is playing
  private playing = false;

  ///////////////////////
  // Template Actions //
  /////////////////////

  @ContentChildren(SlideComponent, { descendants: true }) public slides: QueryList<SlideComponent>;

  @ViewChild('wrapper') private slideWrapper: ElementRef<HTMLDivElement>;

  @ViewChild('slideList') private slideList: ElementRef<HTMLUListElement>;

  constructor(
    private themeService: ThemeService,
    private animationBuilder: AnimationBuilder,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId) {
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.theme = theme
    })
  }

  ngOnInit() { }

  ngAfterViewInit() {
    this.calculateRatio();
    this.autoplay$.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.stopTimer();
      this.startTimer(value);
    });

    this.interval$.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.stopTimer();
      this.resetTimer(value);
      this.startTimer(this._autoplay);
    });

    this.maxWidth$.pipe(takeUntil(this.destroy$)).
      subscribe(() => this.slideTo(0));

    this.loop$.pipe(takeUntil(this.destroy$)).
      subscribe(value => this.listKeyManager.withWrap(value));

    this.slideDirection$.pipe(takeUntil(this.destroy$))
      .subscribe(value => this.listKeyManager.withHorizontalOrientation(value));

    this.slides$.pipe(
      takeUntil(this.destroy$),
      filter(value => value && value < this.slides.length)
    ).subscribe(value => this.resetSlides(value));
  }

  ngAfterContentInit() {
    this.listKeyManager = new ListKeyManager(this.slides)
      .withVerticalOrientation(false)
      .withHorizontalOrientation(this.slideDirection)
      .withWrap(this.loop);

    this.listKeyManager.updateActiveItem(0);

    this.listKeyManager.change
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.playAnimation());
  }

  //////////////
  // Getters //
  ////////////

  get getWidth(): number {
    return this.slideWrapper.nativeElement.clientWidth;
  }

  get currentIndex(): number {
    if (this.listKeyManager) {
      return this.listKeyManager.activeItemIndex;
    }
    return 0;
  }

  ///////////////////////
  // Public Functions //
  /////////////////////

  public next() {
    this.goto(Direction.Right);
  }

  public previous() {
    this.goto(Direction.Left);
  }

  public slideTo(index: number) {
    this.goto(Direction.Index, index);
  }

  @HostListener('mouseenter')
  public onMouseEnter() {
    this.stopTimer();
  }

  @HostListener('mouseleave')
  public onMouseLeave() {
    this.startTimer(this._autoplay);
  }

  @HostListener('mousewheel', ['$event'])
  public onMouseWheel(event: MouseWheelEvent) {
    if (this.swipe) {
      event.preventDefault(); // prevent window to scroll
      const delta = Math.sign(event.DOM_DELTA_LINE);

      if (delta < 0) {
        this.next();
      } else if (delta > 0) {
        this.previous();
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  public onResize() {
    /**
     * Reset slide when window is resized
     * in order to avoid major glitches.
     */
    this.slideTo(0);
  }

  ////////////////////////
  // Private Functions //
  //////////////////////

  private resetSlides(slides: number): void {
    this.slides.reset(this.slides.toArray().slice(0, slides));
  }

  private goto(direction: Direction, index?: number): void {
    if (!this.playing) {
      const rtl = this.slideDirection === 'rtl';

      switch (direction) {
        case Direction.Left:
          return rtl
            ? this.listKeyManager.setNextItemActive()
            : this.listKeyManager.setPreviousItemActive();
        case Direction.Right:
          return rtl
            ? this.listKeyManager.setPreviousItemActive()
            : this.listKeyManager.setNextItemActive();
        case Direction.Index:
          return this.listKeyManager.setActiveItem(index);
      }
    }
  }

  /**
   * @description Will only run in the browser not with SSR
   */
  private isVisible(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      console.error('This will run only in the browser')
      return false;
    }

    const elem = this.slideWrapper.nativeElement;
    const docViewTop = window.pageYOffset;
    const docViewBottom = docViewTop + window.innerHeight;
    const elemOffset = elem.getBoundingClientRect();
    const elemTop = docViewTop + elemOffset.top;
    const elemBottom = elemTop + elemOffset.height;

    return elemBottom <= docViewBottom || elemTop >= docViewTop;
  }

  private stopTimer() {
    this.timerStop$.next();
  }

  private resetTimer(value: number) {
    this.timer$ = interval(value);
  }

  private startTimer(autoplay: boolean) {
    if (!autoplay) {
      return;
    }

    this.timer$.pipe(
      takeUntil(this.timerStop$),
      takeUntil(this.destroy$),
      filter(() => this.isVisible())
    ).subscribe(() => {
      this.listKeyManager.withWrap(true).setNextItemActive();
      this.listKeyManager.withWrap(this.loop);
    });
  }

  private getTranslation(offset: number): string {
    return `translateX(${offset}px)`;
  }

  private getOffset(): number {
    const offset = this.listKeyManager.activeItemIndex * this.getWidth;
    const sign = this.slideDirection === 'rtl' ? 1 : -1;
    return sign * offset;
  }

  private calculateRatio() {
    switch (this.ratio) {
      case '16:9':
        this.slideWrapper.nativeElement.style.paddingBottom = '56.25%';
        break;
      case '1:1':
        this.slideWrapper.nativeElement.style.paddingBottom = '100%';
        break;
      case '3:2':
        this.slideWrapper.nativeElement.style.paddingBottom = '66.66%';
        break;
      case '4:3':
        this.slideWrapper.nativeElement.style.paddingBottom = '75%';
        break;
      case '8:5':
        this.slideWrapper.nativeElement.style.paddingBottom = '62.5%';
    }
  }

  private playAnimation(): void {

    const translation = this.getTranslation(this.getOffset());

    const factory = this.animationBuilder.build(
      animate(this.timing, style({ transform: translation }))
    );

    const animation = factory.create(this.slideList.nativeElement);

    animation.onStart(() => (this.playing = true));

    animation.onDone(() => {
      this.playing = false;
      this.renderer.setStyle(
        this.slideList.nativeElement,
        'transform',
        translation
      );
      animation.destroy();
    });
    animation.play();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
