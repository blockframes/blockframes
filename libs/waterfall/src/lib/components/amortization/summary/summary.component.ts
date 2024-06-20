
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { AmortizationService } from '../../../amortization.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, pluck, switchMap } from 'rxjs';
import { Amortization } from '@blockframes/model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'waterfall-summary-amortization',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallSummaryAmortizationComponent {

  public movie = this.shell.movie;
  public waterfall = this.shell.waterfall;
  public amortization$ = this.route.params.pipe(
    pluck('amortizationId'),
    switchMap((id: string) => this.service.valueChanges(id, { waterfallId: this.shell.waterfall.id })),
  );
  private producer = this.shell.waterfall.rightholders.find(r => r.roles.includes('producer'));
  public contracts$ = combineLatest([this.amortization$, this.shell.contracts$]).pipe(
    map(([amortization, contracts]) => contracts.filter(c => !!this.producer?.id && amortization.contractIds.includes(c.id))),
    map(contracts => contracts.map(c => {
      const rightholderId = c.buyerId === this.producer.id ? c.sellerId : c.buyerId;
      const rightholder = this.shell.waterfall.rightholders.find(r => r.id === rightholderId);
      return { ...c, rightholder };
    }))
  );
  public updating$ = new BehaviorSubject(false);
  public rights$ = combineLatest([this.amortization$, this.shell.rightholderRights$]).pipe(
    map(([amortization, rights]) => rights.filter(r => r.pools.includes(amortization.poolName)))
  );

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private service: AmortizationService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.dynTitle.setPageTitle(this.movie.title.international, $localize`Film Amortization`);
  }

  previous() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  async exit(amortization?: Amortization) {
    this.updating$.next(true);

    if (amortization) {
      amortization.status = 'applied';
      await this.service.update(amortization, { params: { waterfallId: this.shell.waterfall.id } });
      this.snackBar.open($localize`Calculation Method applied`, 'close', { duration: 3000 });
    }

    this.router.navigate(['../../..', 'amortization'], { relativeTo: this.route });
  }
}