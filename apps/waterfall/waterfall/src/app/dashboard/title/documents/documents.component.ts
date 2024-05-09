
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { WaterfallBudgetForm } from '@blockframes/waterfall/form/budget.form';
import { WaterfallFinancingPlanForm } from '@blockframes/waterfall/form/financing-plan.form';
import { WaterfallContractForm } from '@blockframes/waterfall/form/contract.form';
import { BehaviorSubject } from 'rxjs';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

type Path = 'Documents' | 'Contracts' | 'Financing Plan' | 'Budget'; // TODO #9699

@Component({
  selector: 'waterfall-title-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsComponent {

  public contractForm = new WaterfallContractForm({ id: '' });
  public budgetForm = new WaterfallBudgetForm({ id: '' });
  public financingPlanForm = new WaterfallFinancingPlanForm({ id: '' });
  public crumbs$ = new BehaviorSubject<Path[]>(['Documents']);
  public currentPath$ = new BehaviorSubject<Path>('Documents');

  constructor(
    public shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
  ) {
    this.dynTitle.setPageTitle(this.shell.movie.title.international, $localize`Documents`);
  }

  public navigate(path: Path[]) {
    this.crumbs$.next(path);
    this.currentPath$.next(path[path.length - 1]);
  }
}
