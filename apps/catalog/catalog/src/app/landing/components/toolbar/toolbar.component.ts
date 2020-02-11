import { Component, ChangeDetectionStrategy, Input, HostListener } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BehaviorSubject } from 'rxjs';
import { throttleTime, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { AuthStore } from '@blockframes/auth';


@Component({
  selector: 'catalog-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogToolbarComponent {

  @Input() sidenav: MatSidenav;
  private scroll = new BehaviorSubject<number>(0);
  public toolbarColor$ = this.scroll.asObservable().pipe(
    map(position => position === 0),
    distinctUntilChanged(),
    map(isTop => isTop ? 'transparent-toolbar' : '')
  );

  /** Change the toolbar class when page is scrolled. */
  @HostListener('window:scroll', ['$event'])
  scrollHandler(event: Event) {
    this.scroll.next(window.pageYOffset);
  }

  constructor(private authStore: AuthStore) {}

  public isSignin(isSignin: boolean) {
    this.authStore.updateIsSignin(isSignin);
  }
}
