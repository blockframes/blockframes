
// Angular
import { Component, ChangeDetectionStrategy, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardWaterfallShellComponent } from '../shell/shell.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AmortizationFormGuardedComponent } from '../../guards/amortization-form-guard';
import { AmortizationService } from '../../amortization.service';
import { WaterfallContract, WaterfallRightholder, createAmortization, rightholderGroups } from '@blockframes/model';
import { AmortizationForm } from '@blockframes/waterfall/form/amortization.form';

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
    map(contracts => contracts.filter(c => [c.buyerId, c.sellerId].includes(this.producer.id))), // Only contracts where the producer is involved
    map(contracts => contracts.map(c => {
      const rightholderId = c.buyerId === this.producer.id ? c.sellerId : c.buyerId;
      const rightholder = this.shell.waterfall.rightholders.find(r => r.id === rightholderId);
      return { ...c, rightholder };
    }))
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
    const amortization = await this.service.getValue(this.amortizationId, { waterfallId: this.shell.waterfall.id });
    this.amortizationForm.patchValue(amortization);
  }

  previous() {
    this.stepper?.previous();
  }

  next() {
    this.stepper?.next();
  }

  async exit(applied: boolean = false) {
    this.updating$.next(true);
    const amortization = createAmortization({ ...this.amortizationForm.value, waterfallId: this.shell.waterfall.id });
    if (applied) amortization.status = 'applied';
    this.amortizationForm.markAsPristine();
    await this.service.upsert(amortization, { params: { waterfallId: this.shell.waterfall.id } });
    this.snackBar.open('Film Amortization saved', 'close', { duration: 3000 });
    this.router.navigate(['../..', 'amortization'], { relativeTo: this.route });
  }
}