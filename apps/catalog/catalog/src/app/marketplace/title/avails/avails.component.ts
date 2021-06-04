
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ChangeDetectionStrategy, OnDestroy, AfterViewInit } from '@angular/core';

import { filter, switchMap } from 'rxjs/operators';
import { combineLatest, of, ReplaySubject, Subscription } from 'rxjs';

import { FormList } from '@blockframes/utils/form';
import { Scope } from '@blockframes/utils/static-model';
import { MovieQuery, Movie } from '@blockframes/movie/+state';
import { Term, TermService } from '@blockframes/contract/term/+state';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { BucketForm, BucketTermForm } from '@blockframes/contract/bucket/form';
import { OrganizationQuery, OrganizationService } from '@blockframes/organization/+state';
import { BucketQuery, BucketService, BucketTerm } from '@blockframes/contract/bucket/+state';
import { ContractService, isMandate, isSale, Mandate } from '@blockframes/contract/contract/+state';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';

import { ExplanationComponent } from './explanation/explanation.component';

@Component({
  selector: 'catalog-movie-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieAvailsComponent implements AfterViewInit, OnDestroy {
  private subs: Subscription[] = [];

  public movie: Movie = this.movieQuery.getActive();

  public orgId = this.orgQuery.getActiveId();
  public periods = ['days', 'weeks', 'months', 'years'];
  public maxTerritories = 30;

  public bucketForm = new BucketForm();

  public avails = {
    mapForm: new AvailsForm({ territories: [] }, ['duration']),
    calendarForm: new AvailsForm({ territories: [] }, ['territories']),
  };

  public movieOrg$ = this.orgService.valueChanges(this.movie.orgIds[0]);

  /** Raw mandates, straight from the db
   *
   * _(mandates = available contracts)_
  */
  public mandates$ = new ReplaySubject<Mandate[]>();

  /** Raw mandate **(available)** terms, straight from the db
   *
   * _(term = continuous subdivision of a contract, a contract is composed of one or more terms)_
  */
  public mandateTerms$ = new ReplaySubject<Term<Date>[]>();

  /** Raw **sold** terms, straight from the db
   *
   * _(term = continuous subdivision of a contract, a contract is composed of one or more terms)_
  */
  public salesTerms$ = new ReplaySubject<Term<Date>[]>();

  /** Selected terms in the local bucket form, those where available terms that have been selected by the user */
  public terms$ = this.bucketForm.selectTerms(this.movie.id);


  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private movieQuery: MovieQuery,
    private bucketQuery: BucketQuery,
    private termService: TermService,
    private orgQuery: OrganizationQuery,
    private bucketService: BucketService,
    private orgService: OrganizationService,
    private contractService: ContractService,
  ) {
    const sub = this.bucketQuery.selectActive().subscribe(bucket => {
      this.bucketForm.patchAllValue(bucket);
      this.bucketForm.change.next();
    });
    this.subs.push(sub);
    this.init();
  }

  ngAfterViewInit() {
    const fragSub = this.route.fragment.pipe(filter(fragment => !!fragment)).subscribe(fragment => {
      document.querySelector(`#${fragment}`).scrollIntoView({ behavior: 'smooth' });
    });

    const paramsSub = combineLatest([
      this.route.queryParams.pipe(filter(params => !!params.contract && !!params.term)),
      this.bucketQuery.selectActive().pipe(filter(bucket => !!bucket))
    ]).subscribe(([ params, bucket ]) => {
      const term = bucket.contracts[params.contract].terms[params.term];
      this.edit(term);
    });
    this.subs.push(fragSub, paramsSub)
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
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
    this.router.navigate(['/c/o/marketplace/selection']);
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

    if (mode.includes('map')) {
      this.bucketForm.patchValue({}); // Force observable to reload
      this.avails.mapForm.setValue({ exclusive, duration, medias, territories: [] });
    }

    if (mode.includes('calendar')) {
      this.avails.calendarForm.patchValue({ exclusive, medias, territories });
    }

    document.querySelector('#avails').scrollIntoView({ behavior: 'smooth' });
  }

  remove(control: BucketTermForm) {
    const terms = control.parent as FormList<BucketTermForm>;
    const index = terms.controls.findIndex(c => c === control);
    terms.removeAt(index);
    this.bucketForm.change.next();
  }

  clear() {
    this.avails.mapForm.reset();
    this.avails.calendarForm.reset();
    document.querySelector('#avails').scrollIntoView({ behavior: 'smooth' });
  }
}
