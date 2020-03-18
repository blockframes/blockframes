import { Component, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'festival-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
  private scroll = new BehaviorSubject<number>(0);
  public toolbarColor$ = this.scroll.asObservable().pipe(
    map(position => position === 0),
    distinctUntilChanged(),
    map(isTop => isTop ? 'transparent-toolbar' : '')
  );

  /** Change the toolbar class when page is scrolled. */
  @HostListener('window:scroll', ['$event'])
  scrollHandler() {
    this.scroll.next(window.pageYOffset);
  }

}
