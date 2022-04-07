import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ChangeDetectionStrategy, OnDestroy, AfterViewInit } from '@angular/core';
import { delay, filter, pluck, skip, switchMap } from 'rxjs/operators';
import { combineLatest, of, ReplaySubject, Subscription } from 'rxjs';
import { FormList } from '@blockframes/utils/form';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { TermService } from '@blockframes/contract/term/+state';
import { CalendarAvailsForm, MapAvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { BucketForm, BucketTermForm } from '@blockframes/contract/bucket/form';
import { OrganizationService } from '@blockframes/organization/+state';
import { BucketService } from '@blockframes/contract/bucket/+state';
import { ContractService } from '@blockframes/contract/contract/+state';
import { Holdback, isMandate, isSale, Mandate, Sale, BucketTerm, Term, Territory, territories } from '@blockframes/model';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { ExplanationComponent } from './explanation/explanation.component';
import { HoldbackModalComponent } from '@blockframes/contract/contract/holdback/modal/holdback-modal.component';
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { where } from 'firebase/firestore';

@Component({
  selector: 'catalog-movie-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieAvailsComponent implements AfterViewInit, OnDestroy {
  private subs: Subscription[] = [];

  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId))
  );

  public orgId = this.orgService.org.id;
  public periods = ['days', 'weeks', 'months', 'years'];
  public maxTerritories = 30;
  public maxExcludedTerritories = 20;

  public bucketForm = new BucketForm();

  public avails = {
    mapForm: new MapAvailsForm(),
    calendarForm: new CalendarAvailsForm()
  };

  public movieOrg$ = this.movie$.pipe(
    switchMap(movie => this.orgService.valueChanges(movie.orgIds[0]))
  );

  /** Raw mandates, straight from the db
   *
   * _(mandates = contracts to sold might be available or already sold)_
  */
  public mandates$ = new ReplaySubject<Mandate[]>();

  /** Raw mandate terms, straight from the db (might be available or already sold)
   *
   * _(term = continuous subdivision of a contract, a contract is composed of one or more terms)_
  */
  public mandateTerms$ = new ReplaySubject<Term<Date>[]>();

  /** Raw sales, straight from the db
   *
   * _(sales = contracts already sold)_
  */
  public sales$ = new ReplaySubject<Sale[]>();

  /** Raw **sold** terms, straight from the db
   *
   * _(term = continuous subdivision of a contract, a contract is composed of one or more terms)_
  */
  public salesTerms$ = new ReplaySubject<Term<Date>[]>();

  /** Selected terms in the local bucket form, those where available terms that have been selected by the user */
  public terms$ = this.movie$.pipe(
    switchMap(movie => this.bucketForm.selectTerms(movie.id))
  );

  public holdbacks: Holdback[] = [];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private movieService: MovieService,
    private termService: TermService,
    private bucketService: BucketService,
    private orgService: OrganizationService,
    private contractService: ContractService,
  ) {
    const sub = this.bucketService.active$.subscribe(bucket => {
      this.bucketForm.patchAllValue(bucket);
      this.bucketForm.change.next();
    });
    this.subs.push(sub);
    this.init();
  }

  ngAfterViewInit() {
    const queryParams = this.route.snapshot.queryParams
    let skipValue = 0;
    if ('contract' in queryParams) {
      skipValue = 1
      const selector = "[data-scroll-to-view-id='" + queryParams.contract + "']"
      //@why: #6383
      setTimeout(() => {
        const element = document.querySelector<HTMLElement>(selector);
        scrollIntoView(element);
      }, 400);

    }


    const fragSub = this.route.fragment.pipe(
      filter(fragment => !!fragment),
      skip(skipValue),
      //@why: #6383
      delay(100)
    ).subscribe(fragment => scrollIntoView(document.querySelector(`#${fragment}`)));

    this.subs.push(fragSub);

    const paramsSub = combineLatest([
      this.route.queryParams.pipe(filter(params => !!params.contract && !!params.term)),
      this.bucketService.active$.pipe(filter(bucket => !!bucket))
    ]).subscribe(([params, bucket]) => {
      const term = bucket.contracts[params.contract].terms[params.term];
      this.edit(term);
    });

    this.subs.push(paramsSub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  private async init() {

    const movieId = this.route.snapshot.params.movieId;
    const contractsQuery = [where('titleId', '==', movieId), where('status', '==', 'accepted')];
    const contracts = await this.contractService.getValue(contractsQuery);

    const mandates = contracts.filter(isMandate);
    const sales = contracts.filter(isSale);

    this.holdbacks = sales.map(sale => sale.holdbacks).flat();

    const [mandateTerms, salesTerms] = await Promise.all([
      this.termService.getValue(mandates.map(mandate => mandate.termIds).flat()),
      this.termService.getValue(sales.map(sale => sale.termIds).flat()),
    ]);

    this.mandates$.next(mandates);
    this.sales$.next(sales);
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
      width: '80vw',
      autoFocus: false
    });
  }

  /** Open a modal to display the entire list of territories when this one is too long */
  public openTerritoryModal(term: BucketTerm) {
    this.dialog.open(DetailedTermsComponent, { data: { terms: term.territories, scope: 'territories' }, maxHeight: '80vh', autoFocus: false });
  }

  /** Open a modal to display holdback warnings */
  openHoldbackModal(holdbacks: Holdback[]) {
    this.dialog.open(HoldbackModalComponent, { data: { holdbacks, withWarning: true }, maxHeight: '80vh' });
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
        confirm: 'Leave anyway',
        cancel: 'Stay',
      },
      autoFocus: false,
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
      this.avails.mapForm.setValue({ exclusive, duration, medias });
    }

    if (mode.includes('calendar')) {
      this.avails.calendarForm.patchValue({ exclusive, medias, territories });
    }

    scrollIntoView(document.querySelector('#avails'));
  }

  remove(control: BucketTermForm) {
    const terms = control.parent as FormList<BucketTermForm>;
    const index = terms.controls.findIndex(c => c === control);
    terms.removeAt(index);
    this.bucketForm.change.next();
  }

  clear() {
    scrollIntoView(document.querySelector('#avails'));
    this.avails.mapForm.reset();
    this.avails.calendarForm.reset();
  }

  excludedTerritories(currentTerritoryList: Territory[]) {
    // List all keys of territories
    // Remove the word 'world' from the array
    const listKeys = Object.keys(territories).filter((t: Territory) => t !== 'world') as Territory[];
    // Filter to include only current territories and get the value of each keys
    return listKeys
      .filter(territory => !currentTerritoryList.includes(territory))
      .map(territory => territories[territory]);
  }
}
