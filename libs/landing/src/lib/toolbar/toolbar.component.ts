import { Component, ChangeDetectionStrategy, HostListener, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';


@Component({
  selector: '[imgAsset] landing-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingToolbarComponent {
  @Input() imgAsset = 'LogoArchipelContentPrimary.svg';
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
