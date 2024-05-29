
// Angular
import { Component, ChangeDetectionStrategy, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { AmortizationFormGuardedComponent } from '../../../guards/amortization-form-guard';
import { AmortizationService } from '../../../amortization.service';
import { WaterfallContract, WaterfallRightholder, createAmortization, getDefaultVersionId, getNonEditableNodeIds, rightholderGroups } from '@blockframes/model';
import { AmortizationForm } from '../../../form/amortization.form';

@Component({
  selector: 'waterfall-edit-amortization',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallEditAmortizationComponent implements AmortizationFormGuardedComponent, OnInit {
  @ViewChild('stepper') stepper?: MatStepper;

  private amortizationId: string = this.route.snapshot.params.amortizationId;
  private producer = this.shell.waterfall.rightholders.find(r => r.roles.includes('producer'));

  public movie = this.shell.movie;
  public updating$ = new BehaviorSubject(false);
  public amortizationForm = new AmortizationForm({ id: this.amortizationId });
  public contracts$: Observable<(WaterfallContract & { rightholder: WaterfallRightholder })[]> = this.shell.contracts$.pipe(
    map(contracts => contracts.filter(c => Object.keys(rightholderGroups.beneficiaries).includes(c.type))), // Only contract for outgoing statements
    map(contracts => contracts.filter(c => !!this.producer?.id && [c.buyerId, c.sellerId].includes(this.producer.id))), // Only contracts where the producer is involved
    map(contracts => contracts.map(c => {
      const rightholderId = c.buyerId === this.producer.id ? c.sellerId : c.buyerId;
      const rightholder = this.shell.waterfall.rightholders.find(r => r.id === rightholderId);
      return { ...c, rightholder };
    }))
  );
  public nonEditableNodeIds$ = combineLatest([
    this.shell.rightholderRights$,
    this.shell.rightholderSources$,
    this.shell.statements$.pipe(map(statements => statements.filter(s => s.status === 'reported'))),
    this.shell.incomes$,
  ]).pipe(
    map(([rights, sources, reportedStatements, incomes]) => {
      const defaultVersionId = getDefaultVersionId(this.shell.waterfall);
      this.shell.setVersionId(defaultVersionId);
      return getNonEditableNodeIds(rights, sources, reportedStatements, incomes);
    })
  );

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private shell: DashboardWaterfallShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private service: AmortizationService
  ) {
    this.dynTitle.setPageTitle(this.movie.title.international, 'Film Amortization');
  }

  async ngOnInit() {
    this.shell.versionId$
    const amortization = await this.service.getValue(this.amortizationId, { waterfallId: this.shell.waterfall.id });
    this.amortizationForm.patchValue(amortization);
  }

  previous() {
    this.stepper?.previous();
  }

  next() {
    this.stepper?.next();
  }

  async exit(redirectToSummary: boolean = false) {
    this.updating$.next(true);
    const amortization = createAmortization({ ...this.amortizationForm.value, waterfallId: this.shell.waterfall.id });
    
    this.amortizationForm.markAsPristine();
    await this.service.upsert(amortization, { params: { waterfallId: this.shell.waterfall.id } });
    this.snackBar.open('Film Amortization saved', 'close', { duration: 3000 });
    if(redirectToSummary) {
      this.router.navigate(['summary'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../..', 'amortization'], { relativeTo: this.route });
    }
  }

  public selectPool(pool: string) {
    this.amortizationForm.get('poolName').setValue(pool);
  }
}