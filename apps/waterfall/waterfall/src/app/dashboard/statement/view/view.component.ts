import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Statement } from '@blockframes/model';

import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { combineLatest, filter, firstValueFrom, map, pluck } from 'rxjs';

@Component({
  selector: 'waterfall-statement-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementViewComponent implements OnInit {

  private statement$ = combineLatest([this.route.params.pipe(pluck('statementId')), this.shell.statements$]).pipe(
    map(([statementId, statements]) => statements.find(s => s.id === statementId)),
    filter(statement => !!statement),
  );
  public statement: Statement;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
  ) {
    this.shell.setDate(undefined);
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'View Statement');
  }

  async ngOnInit() {
    this.statement = await firstValueFrom(this.statement$);

    console.log(this.statement);
  }
}