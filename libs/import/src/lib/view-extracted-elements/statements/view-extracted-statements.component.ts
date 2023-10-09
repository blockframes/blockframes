import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { StatementsImportState } from '../../utils';
import { formatStatement } from './utils';
import { MovieService } from '@blockframes/movie/service';
import { AuthService } from '@blockframes/auth/service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { IncomeService } from '@blockframes/contract/income/service';
import { ExpenseService } from '@blockframes/contract/expense/service';

@Component({
  selector: 'import-view-extracted-statements[sheetTab]',
  templateUrl: './view-extracted-statements.component.html',
  styleUrls: ['./view-extracted-statements.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedStatementsComponent implements OnInit {

  @Input() sheetTab: SheetTab;

  public statementsToCreate$ = new BehaviorSubject<MatTableDataSource<StatementsImportState>>(null);

  constructor(
    private dynTitle: DynamicTitleService,
    private movieService: MovieService,
    private authService: AuthService,
    private waterfallService: WaterfallService,
    private statementService: StatementService,
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
  ) {
    this.dynTitle.setPageTitle('Submit your statements');
  }

  async ngOnInit() {
    const statementsToCreate = await formatStatement(
      this.sheetTab,
      this.waterfallService,
      this.movieService,
      this.statementService,
      this.incomeService,
      this.expenseService,
      this.authService.profile.orgId,
    );

    this.statementsToCreate$.next(new MatTableDataSource(statementsToCreate));
  }
}
