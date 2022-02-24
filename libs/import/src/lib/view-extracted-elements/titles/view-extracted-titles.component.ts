
import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';

import { BehaviorSubject } from 'rxjs';
import { UserService } from '@blockframes/user/+state';
import { getCurrentApp } from '@blockframes/utils/apps';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { formatTitle } from './utils';
import { MovieImportState } from '../../utils';
import { AuthService } from '@blockframes/auth/+state';
import { take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

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
    private userService: UserService,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit() {
    const isBlockframesAdmin = await this.authService.isBlockframesAdmin$.pipe(take(1)).toPromise();
    const app = getCurrentApp(this.route);
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
