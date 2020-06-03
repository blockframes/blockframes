// Angular
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';

// Blockframes
import { getAppName } from '@blockframes/utils/apps';
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
  public section$: Observable<'dashboard' | 'marketplace'>;

  constructor(private routerQuery: RouterQuery, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.section$ = this.routerQuery.select('state').pipe(map(data => getAppLocation(data.url)));
  }
}
