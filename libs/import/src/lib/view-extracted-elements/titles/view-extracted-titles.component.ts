
import { Component, ChangeDetectionStrategy, OnInit, Input, Inject } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';

import { BehaviorSubject } from 'rxjs';
import { UserService } from '@blockframes/user/+state';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { formatTitle } from './utils';
import { MovieImportState } from '../../utils';
import { AuthService } from '@blockframes/auth/+state';
import { take } from 'rxjs/operators';
import { APP } from '@blockframes/utils/routes/create-routes';
import { App } from '@blockframes/utils/apps';

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
    @Inject(APP) private app: App
  ) { }

  async ngOnInit() {
    const isBlockframesAdmin = await this.authService.isBlockframesAdmin$.pipe(take(1)).toPromise();
    const titles = await formatTitle(
      this.sheetTab,
      this.userService,
      isBlockframesAdmin,
      this.authService.profile.orgId,
      this.app
    );
    this.moviesToCreate$.next(new MatTableDataSource(titles));
  }
}
