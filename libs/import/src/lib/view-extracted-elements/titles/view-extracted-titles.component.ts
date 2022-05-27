
import { Component, ChangeDetectionStrategy, OnInit, Input, Inject } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';

import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { UserService } from '@blockframes/user/service';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { formatTitle } from './utils';
import { MovieImportState } from '../../utils';
import { AuthService } from '@blockframes/auth/service';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/model';

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
    const isBlockframesAdmin = await firstValueFrom(this.authService.isBlockframesAdmin$);
    const titles = await formatTitle(
      this.sheetTab,
      this.userService,
      isBlockframesAdmin,
      this.authService.profile.orgId,
      this.app
    );

    const moviesToCreate = titles.filter(title => !title.movie.id);
    const moviesToUpdate = titles.filter(title => title.movie.id);
    this.moviesToUpdate$.next(new MatTableDataSource(moviesToUpdate));
    this.moviesToCreate$.next(new MatTableDataSource(moviesToCreate));
  }
}
