// Angular
import {
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  Directive,
  HostBinding,
  ElementRef,
} from '@angular/core';
import { CdkScrollable } from '@angular/cdk/overlay';

// RxJs
import { Observable } from 'rxjs';


@Component({
  selector: 'bf-carousel',
  templateUrl: 'carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent {

  public currentPosition: number;

  // Indicators to show arrow buttons
  public showBack: Observable<boolean>;
  public showForward: Observable<boolean>;

  @ViewChild(CdkScrollable) scrollable: CdkScrollable;
  @ViewChild('container') container: ElementRef<HTMLDivElement>;

  scrollTo(direction: 'left' | 'right') {
    this.currentPosition = this.scrollable.measureScrollOffset('left');
    const clientWidth = this.container.nativeElement.clientWidth

    direction === 'right'
      ? this.scrollable.scrollTo({ left: this.currentPosition + clientWidth })
      : this.scrollable.scrollTo({ left: this.currentPosition - clientWidth })
  }

  // TODO #2835
/*   onScrolling(direction: 'right' | 'left') {
    return this.scrollable.elementScrolled().pipe(
      debounceTime(50),
      map(_ => !!this.scrollable.measureScrollOffset(direction)),
      distinctUntilChanged(),
      tap(_ => this.cdr.detectChanges()),
      startWith(direction === 'right' ? true : false),
    )
  } */
}

@Directive({ selector: '[carouselItem]' })
export class CarouselItemDirective {
  @HostBinding('style.flexShrink') shrink = 0;
}