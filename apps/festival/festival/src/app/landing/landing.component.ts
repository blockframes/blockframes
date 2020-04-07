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
  
  // According to this article, it's fine with Angular Universal
  // source: https://technoapple.com/blog/post/scroll-event-at-angular-universal
  /** Change the toolbar class when page is scrolled. */
  @HostListener('window:scroll', [])
  scrollHandler() {
    this.scroll.next(window.pageYOffset);
  }

}
