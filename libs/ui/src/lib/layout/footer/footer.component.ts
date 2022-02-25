// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { getAppName, getCurrentModule } from '@blockframes/utils/apps';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

// Libs
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'bf-footer',
  templateUrl: 'footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  private app = this.appGuard.currentApp;
  public appName = getAppName(this.app).label;
  private urlSnapshot = this.router.routerState.snapshot.url;
  public section$ = this.router.events.pipe(
    startWith(this.urlSnapshot),
    map(event => event instanceof NavigationEnd ? event.url : this.urlSnapshot),
    map(url => getCurrentModule(url))
  );

  public currentYear = new Date().getFullYear();

  constructor(private appGuard: AppGuard, private router: Router) { }

}
