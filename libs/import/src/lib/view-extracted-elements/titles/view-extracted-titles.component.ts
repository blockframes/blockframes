
import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';

import { BehaviorSubject } from 'rxjs';
import { RouterQuery } from '@datorama/akita-ng-router-store';

import { UserService } from '@blockframes/user/+state';
import { getCurrentApp } from '@blockframes/utils/apps';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';

import { formatTitle } from './utils';
import { MovieImportState } from '../../utils';


@Component({
  selector: 'import-view-extracted-titles[sheetTab]',
  templateUrl: './view-extracted-titles.component.html',
  styleUrls: ['./view-extracted-titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedTitlesComponent implements OnInit {

  @Input() sheetTab: SheetTab;

  public moviesToCreate$ = new BehaviorSubject<MatTableDataSource<MovieImportState>>(null);
  public moviesToUpdate$ = new BehaviorSubject<MatTableDataSource<MovieImportState>>(null);

  constructor(
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery,
    private userService: UserService,
  ) { }

  async ngOnInit() {
    const app = getCurrentApp(this.routerQuery);
    const titles = await formatTitle(
      this.sheetTab,
      this.userService,
      this.authQuery.isBlockframesAdmin,
      this.authQuery.user.orgId,
      app
    );
    this.moviesToCreate$.next(new MatTableDataSource(titles));
  }
}
