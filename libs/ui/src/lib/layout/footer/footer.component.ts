// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { getAppName, getCurrentApp } from '@blockframes/utils/apps';

// Blockframes
import { getAppLocation } from '@blockframes/utils/helpers';

// Libs
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'bf-footer',
  templateUrl: 'footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit {
  public appName: string;
  public section$: Observable<'dashboard' | 'marketplace'>;
  public currentYear = new Date().getFullYear();

  constructor(private routerQuery: RouterQuery) { }

  ngOnInit() {
    const app = getCurrentApp(this.routerQuery);
    this.appName = getAppName(app).label;
    this.section$ = this.routerQuery.select('state').pipe(map(data => getAppLocation(data.url)));
  }
}
