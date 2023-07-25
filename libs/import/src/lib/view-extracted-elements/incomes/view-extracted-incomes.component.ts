import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { IncomesImportState } from '../../utils';
import { formatIncome } from './utils';
import { MovieService } from '@blockframes/movie/service';
import { AuthService } from '@blockframes/auth/service';

@Component({
  selector: 'import-view-extracted-incomes[sheetTab]',
  templateUrl: './view-extracted-incomes.component.html',
  styleUrls: ['./view-extracted-incomes.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedIncomesComponent implements OnInit {

  @Input() sheetTab: SheetTab;

  public incomesToCreate$ = new BehaviorSubject<MatTableDataSource<IncomesImportState>>(null);

  constructor(
    private dynTitle: DynamicTitleService,
    private movieService: MovieService,
    private authService: AuthService,
  ) {
    this.dynTitle.setPageTitle('Submit your incomes');
  }

  async ngOnInit() {
    const incomesToCreate = await formatIncome(
      this.sheetTab,
      this.movieService,
      this.authService.profile.orgId,
    );
    this.incomesToCreate$.next(new MatTableDataSource(incomesToCreate));
  }
}
