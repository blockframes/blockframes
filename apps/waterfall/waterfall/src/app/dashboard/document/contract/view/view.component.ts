import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'waterfall-contract-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractViewComponent {

  private contractId = this.route.snapshot.paramMap.get('documentId');
  public waterfall = this.shell.waterfall;

  public contract$ = this.shell.contractsAndTerms$.pipe(
    map(contracts => contracts.find(c => c.id === this.contractId)),
  );

  public file$ = this.contract$.pipe(
    map(contract => this.shell.waterfall.documents.find(f => f.id === contract.id))
  );

  public movie = this.shell.movie;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private route: ActivatedRoute
  ) { }

}