// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { getAppName, getCurrentApp, getCurrentModule } from '@blockframes/utils/apps';

// Libs
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'bf-footer',
  templateUrl: 'footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  private app = getCurrentApp(this.route);
  public appName = getAppName(this.app).label;
  private urlSnapshot = this.router.routerState.snapshot.url;
  public section$ = this.router.events.pipe(
    startWith(this.urlSnapshot),
    map(event => event instanceof NavigationEnd ? event.url : this.urlSnapshot),
    map(url => getCurrentModule(url))
  );

  public currentYear = new Date().getFullYear();

  constructor(private route: ActivatedRoute, private router: Router) { }

}
