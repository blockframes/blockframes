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

  private totalWidth: number;

  @ViewChild(CdkScrollable) scrollable: CdkScrollable;

  constructor(private layout: Layout) { }

  ngAfterViewInit() {
    this.currentPosition = this.scrollable.measureScrollOffset('left')
    this.totalWidth = this.scrollable.measureScrollOffset('end');
  }

  scrollTo(direction: 'left' | 'right') {
    this.currentPosition = this.scrollable.measureScrollOffset('left');
    // TODO MF this.layotu.width is not 100% correct cause it is not respecting the margin
    direction === 'right'
      ? this.scrollable.scrollTo({ left: this.currentPosition + this.layout.width.getValue() })
      : this.scrollable.scrollTo({ left: this.currentPosition - this.layout.width.getValue() })

  }
}

@Directive({ selector: '[shrink]' })
export class SchrinkDirective {
  @HostBinding('style.flexShrink') shrink = 0;
}