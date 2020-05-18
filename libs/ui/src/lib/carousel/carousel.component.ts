// Angular
import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  Directive,
  HostBinding
} from '@angular/core';
import { CdkScrollable } from '@angular/cdk/overlay';
import { Layout } from '../layout/layout.module';

@Component({
  selector: 'bf-carousel',
  templateUrl: 'carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent implements AfterViewInit {

  public currentPosition: number;

  public showBackwardBtn = false;

  public showForwardBtn = true;

  @ViewChild(CdkScrollable) scrollable: CdkScrollable;

  constructor(private layout: Layout) { }

  ngAfterViewInit() {
    this.currentPosition = this.scrollable.measureScrollOffset('left')
  }

  scrollTo(direction: 'left' | 'right') {
    /* If they both has the same number, it means there is nothing to scroll, so we want to disable the forward button */
    if(this.scrollable.measureScrollOffset('right') === this.scrollable.measureScrollOffset('end')) {
      return this.showForwardBtn = true;
    }
    /*  If right === 0 it means that we are at the end and want to start from the beginning again. */
    if (!this.scrollable.measureScrollOffset('right')) {
      this.scrollable.scrollTo({ left: 0 })
      this.showBackwardBtn = false
    }
    this.currentPosition = this.scrollable.measureScrollOffset('left');
    /* 
    * If the forward button is clicked the current position is still 0, cause the cdk
    * only updates the state after the scroll animation happened. But we know, if this function
    * was called, we can be sure the user scrolled to the left. So we want to show the backwards button.
    * If the user reached the very right end, we scroll back to the beginning and the currentPosition is !== 0
    * so we hide the button
    */
    this.currentPosition === 0
      ? this.showBackwardBtn = true
      : this.showBackwardBtn = false

    direction === 'right'
      ? this.scrollable.scrollTo({ left: this.currentPosition + this.layout.width.getValue() })
      : this.scrollable.scrollTo({ left: this.currentPosition - this.layout.width.getValue() })
  }
}

@Directive({ selector: '[shrink]' })
export class SchrinkDirective {
  @HostBinding('style.flexShrink') shrink = 0;
}