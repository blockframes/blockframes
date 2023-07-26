import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ExpensesImportState } from '../../utils';
import { formatExpense } from './utils';
import { MovieService } from '@blockframes/movie/service';
import { AuthService } from '@blockframes/auth/service';

@Component({
  selector: 'import-view-extracted-expenses[sheetTab]',
  templateUrl: './view-extracted-expenses.component.html',
  styleUrls: ['./view-extracted-expenses.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedExpensesComponent implements OnInit {

  @Input() sheetTab: SheetTab;

  public expensesToCreate$ = new BehaviorSubject<MatTableDataSource<ExpensesImportState>>(null);

  constructor(
    private dynTitle: DynamicTitleService,
    private movieService: MovieService,
    private authService: AuthService
  ) {
    this.dynTitle.setPageTitle('Submit your expenses');
  }

  async ngOnInit() {
    const expensesToCreate = await formatExpense(
      this.sheetTab,
      this.movieService,
      this.authService.profile.orgId,
    );
    this.expensesToCreate$.next(new MatTableDataSource(expensesToCreate));
  }
}
