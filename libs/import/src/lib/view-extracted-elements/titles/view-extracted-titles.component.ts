
import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';

import { BehaviorSubject } from 'rxjs';
import { RouterQuery } from '@datorama/akita-ng-router-store';

import { UserService } from '@blockframes/user/+state';
import { getCurrentApp } from '@blockframes/utils/apps';
import { SheetTab } from '@blockframes/utils/spreadsheet';

import { formatTitle } from './utils';
import { MovieImportState } from '../../utils';
import { AuthService } from '@blockframes/auth/+state';
import { take } from 'rxjs/operators';


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
    private authService: AuthService,
    private routerQuery: RouterQuery,
    private userService: UserService,
  ) { }

  async ngOnInit() {
    const isBlockframesAdmin = await this.authService.isBlockframesAdmin$.pipe(take(1)).toPromise();
    const app = getCurrentApp(this.routerQuery);
    const titles = await formatTitle(
      this.sheetTab,
      this.userService,
      isBlockframesAdmin,
      this.authService.profile.orgId,
      app
    );
    this.moviesToCreate$.next(new MatTableDataSource(titles));
  }
}
