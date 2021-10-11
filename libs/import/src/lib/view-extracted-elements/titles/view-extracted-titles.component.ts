
import { Component, ChangeDetectionStrategy, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';

import { BehaviorSubject } from 'rxjs';
import { RouterQuery } from '@datorama/akita-ng-router-store';

import { UserService } from '@blockframes/user/+state';
import { getCurrentApp } from '@blockframes/utils/apps';
import { MovieService } from '@blockframes/movie/+state';
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
  @Output() cancelEvent = new EventEmitter<boolean>();

  public moviesToCreate$ = new BehaviorSubject<MatTableDataSource<MovieImportState>>(null);
  public moviesToUpdate$ = new BehaviorSubject<MatTableDataSource<MovieImportState>>(null);

  constructor(
    private router: RouterQuery,
    private authQuery: AuthQuery,
    private userService: UserService,
    private movieService: MovieService,
  ) { }

  async ngOnInit() {
    const orgId = !this.authQuery.isBlockframesAdmin ? this.authQuery.user.orgId : undefined;

    const { moviesToCreate, moviesToUpdate } = await formatTitle(
      this.sheetTab,
      this.movieService,
      this.userService,
      this.authQuery.isBlockframesAdmin,
      getCurrentApp(this.router),
      orgId,
    );
    this.moviesToCreate$.next(new MatTableDataSource(moviesToCreate));
    this.moviesToUpdate$.next(new MatTableDataSource(moviesToUpdate));
  }
}
