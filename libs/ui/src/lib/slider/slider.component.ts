// RxJs
import { Subscription } from 'rxjs';

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
  AfterViewInit,
  QueryList,
  ContentChildren,
  ElementRef,
  ViewChild
} from '@angular/core';
import { AnimationBuilder } from '@angular/animations';

@Component({
  selector: 'bf-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderComponent implements OnInit, OnDestroy, AfterViewInit, Slider {

  //////////////////
  // Public Vars //
  ////////////////

  public theme: Slider['theme']

  /////////////
  // Inputs //
  ///////////

  @Input() timing: Slider['timing'] = '250ms ease-in';

  @Input() interval: Slider['interval'] = 3;

  @Input() hideArrows: Slider['hideArrows'] = false;

  @Input() hideIndicators: Slider['hideIndicators'] = false;

  @Input() ratio: Slider['ratio'];

  @Input() slideDirection: Slider['slideDirection'] = 'ltr';

  @Input() arrowBack: Slider['arrowBack'] = 'arrow_back';

  @Input() arrowForward: Slider['arrowForward'] = 'arrow_forward'

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
  private _loop: Slider['loop']
  private themeSub: Subscription;

  ///////////////////////
  // Template Actions //
  /////////////////////

  @ContentChildren(SlideComponent, { descendants: true }) public slides: QueryList<SlideComponent>;

  @ViewChild('wrapper') private slideWrapper: ElementRef<HTMLDivElement>;

  @ViewChild('slideList') private slideList: ElementRef<HTMLUListElement>;

  constructor(
    private themeService: ThemeService,
    private builder: AnimationBuilder) {
    this.themeSub = this.themeService.theme$.subscribe(theme => {
      this.theme = theme as Slider['theme'];
    })
  }

  ngOnInit() { }

  ngAfterViewInit() {
    console.log(this.slides)
  }

  ngOnDestroy() {
    if (this.themeSub) this.themeSub.unsubscribe();
  }
}
