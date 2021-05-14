
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

import { switchMap } from 'rxjs/operators';
import { of, ReplaySubject, Subscription } from 'rxjs';

import { FormList } from '@blockframes/utils/form';
import { Scope } from '@blockframes/utils/static-model';
import { MovieQuery, Movie } from '@blockframes/movie/+state';
import { Term, TermService } from '@blockframes/contract/term/+state';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { BucketForm, BucketTermForm } from '@blockframes/contract/bucket/form';
import { OrganizationQuery, OrganizationService } from '@blockframes/organization/+state';
import { BucketQuery, BucketService, BucketTerm } from '@blockframes/contract/bucket/+state';
import { ContractService, isMandate, isSale, Mandate, Sale } from '@blockframes/contract/contract/+state';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';

import { ExplanationComponent } from './explanation/explanation.component';


@Component({
  selector: 'catalog-movie-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieAvailsComponent implements OnDestroy {
  private sub: Subscription;

  public movie: Movie = this.movieQuery.getActive();

  public orgId = this.orgQuery.getActiveId();
  public periods = ['weeks', 'months', 'years'];
  public maxTerritories = 30;

  public bucketForm = new BucketForm();

  public avails = {
    mapForm: new AvailsForm({ territories: [] }, ['duration']),
    calendarForm: new AvailsForm({ territories: [] }, ['territories']),
  };

  public movieOrg$ = this.orgService.valueChanges(this.movie.orgIds[0]);

  public mandates$ = new ReplaySubject<Mandate[]>();
  public mandateTerms$ = new ReplaySubject<Term<Date>[]>();
  public salesTerms$ = new ReplaySubject<Term<Date>[]>();

  public terms$ = this.bucketForm.selectTerms(this.movie.id);


  constructor(
    private dialog: MatDialog,
    private movieQuery: MovieQuery,
    private bucketQuery: BucketQuery,
    private termService: TermService,
    private orgQuery: OrganizationQuery,
    private bucketService: BucketService,
    private orgService: OrganizationService,
    private contractService: ContractService,
    private snackbar: MatSnackBar,
    private router: Router,
  ) {
    this.sub = this.bucketQuery.selectActive().subscribe(bucket => {
      this.bucketForm.patchAllValue(bucket);
      this.bucketForm.change.next();
    });
    this.init();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private async init() {

    const contracts = await this.contractService.getValue(ref => ref.where('titleId', '==', this.movie.id).where('status', '==', 'accepted'));

    const mandates = contracts.filter(isMandate);
    const sales = contracts.filter(isSale);

    const [mandateTerms, salesTerms] = await Promise.all([
      this.termService.getValue(mandates.map(mandate => mandate.termIds).flat()),
      this.termService.getValue(sales.map(sale => sale.termIds).flat())
    ]);

    this.mandates$.next(mandates);
    this.mandateTerms$.next(mandateTerms);
    this.salesTerms$.next(salesTerms);
  }

  public async addToSelection() {
    const contracts = this.bucketForm.value.contracts;
    await this.bucketService.upsert({ id: this.orgId, contracts });
    this.bucketForm.markAsPristine();
    this.snackbar
      .open(`${this.movie.title.international} Rights were added to your Selection`, 'GO TO SELECTION', { duration: 5000 })
      .onAction()
      .subscribe(() => this.router.navigate(['/c/o/marketplace/selection']));
  }

  public explain() {
    this.dialog.open(ExplanationComponent, {
      height: '80vh',
      width: '80vw'
    });
  }

  /** Open a modal to display the entire list of territories when this one is too long */
  public openTerritoryModal(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: { terms, scope }, maxHeight: '80vh' });
  }

  confirmExit() {
    const isPristine = this.bucketForm.pristine;
    if (isPristine) {
      return of(true);
    }
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'You are about to leave the page',
        question: 'Some changes have not been added to Selection. If you leave now, you will lose these changes.',
        buttonName: 'Leave anyway'
      }
    });
    return dialogRef.afterClosed().pipe(
      /* Undefined means user clicked on the backdrop, meaning just close the modal */
      switchMap(exit => of(exit ?? false))
    );
  }

  edit({ exclusive, duration, medias, territories }: BucketTerm) {
    const mode = this.router.url.split('/').pop();

    if (mode === 'map') {
      this.avails.mapForm.setValue({ exclusive, duration, medias, territories: [] });
    }

    if (mode === 'calendar') {
      this.avails.calendarForm.setValue({ exclusive, medias, territories });
    }
  }

  remove(control: BucketTermForm) {
    const terms = control.parent as FormList<BucketTermForm>;
    const index = terms.controls.findIndex(c => c === control);
    terms.removeAt(index);
    this.bucketForm.change.next();
  }
}
