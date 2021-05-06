import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MovieQuery, Movie, createMovieLanguageSpecification } from '@blockframes/movie/+state';
import { TerritoryValue, territoriesISOA3, territories, Language } from '@blockframes/utils/static-model';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService, OrganizationQuery } from '@blockframes/organization/+state';
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from 'rxjs';
import { Contract, ContractService, Mandate, Sale } from '@blockframes/contract/contract/+state';
import { getMandateTerms, getSoldTerms, getTerritories } from '@blockframes/contract/avails/avails';
import { Term, TermService } from '@blockframes/contract/term/+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Bucket, BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';
import { BucketTermForm, BucketForm } from '@blockframes/contract/bucket/form';
import { VersionSpecificationForm } from '@blockframes/movie/form/movie.form';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { map, switchMap } from 'rxjs/operators';
import { TerritoryMarker } from '@blockframes/ui/map/map.component';

@Component({
  selector: 'catalog-movie-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieAvailsComponent implements OnInit, OnDestroy {
  public movie: Movie = this.movieQuery.getActive();
  public org$: Observable<Organization>;
  public orgId = this.orgQuery.getActiveId();
  public bucket$: Observable<Bucket>;
  public periods = ['weeks', 'months', 'years'];
  private sub: Subscription;

  private mandates: Mandate[];
  private sales: Sale[];
  private mandateTerms: Term<Date>[];
  private salesTerms: Term<Date>[];

  /** Languages Form */
  public languageCtrl = new FormControl();
  public showButtons = true;

  public hoveredTerritory: {
    name: string;
    status: string;
  }

  public bucketForm = new BucketForm();
  public availsForm = new AvailsForm({ territories: [] }, ['duration']);
  public terms$ = this.bucketForm.selectTerms(this.movie.id);

  /** List of world map territories */
  available$ = new BehaviorSubject<TerritoryMarker[]>([]); // @TODO #5573 Transform into record<slug, TerritoryMarker> & clean TerritoryMarker for unused attr
  sold$ = new BehaviorSubject<TerritoryMarker[]>([]);
  selected$ = combineLatest([ // @TODO #5573 => display existing bucket
    this.availsForm.value$,
    this.bucketForm.value$,
    this.available$,
  ]).pipe(map(([avail, bucket, markers]) =>
    getTerritories(avail, bucket).map(t => markers.find(m => m.slug === t))
  ))

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private orgQuery: OrganizationQuery,
    private contractService: ContractService,
    private termService: TermService,
    private snackBar: MatSnackBar,
    private bucketQuery: BucketQuery,
    private dialog: MatDialog,
    private bucketService: BucketService
  ) { }

  public async ngOnInit() {
    this.org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);

    this.sub = this.bucketQuery.selectActive().subscribe(bucket => {
      this.bucketForm.patchAllValue(bucket);
      this.bucketForm.change.next();
    });

    const contracts = await this.contractService.getValue(ref => ref.where('titleId', '==', this.movie.id).where('status', '==', 'accepted'));

    this.mandates = contracts.filter(c => c.type === 'mandate').map(c => c as Mandate);
    this.sales = contracts.filter(c => c.type === 'sale').map(c => c as Sale);

    this.mandateTerms = await this.termService.getValue(this.mandates.map(m => m.termIds).flat());
    this.salesTerms = await this.termService.getValue(this.sales.map(m => m.termIds).flat());
  }

  public ngOnDestroy() {
    this.sub.unsubscribe();
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
    })
    return dialogRef.afterClosed().pipe(
      switchMap(exit => {
        /* Undefined means user clicked on the backdrop, meaning just close the modal */
        if (typeof exit === 'undefined') {
          return of(false);
        }
        return of(exit)
      })
    )
  }

  applyFilters() {
    if (this.availsForm.invalid) {
      this.snackBar.open('Invalid form', '', { duration: 2000 });
      return;
    }

    // Territories available after form filtering
    const mandateTerms = getMandateTerms(this.availsForm.value, this.mandateTerms);
    const available: TerritoryMarker[] = mandateTerms.map(term => term.territories
      .filter(t => !!territoriesISOA3[t])
      .map(territory => ({
        slug: territory,
        isoA3: territoriesISOA3[territory],
        label: territories[territory],
        contract: this.mandates.find(m => m.id === term.contractId),
        term,
      }))
    ).flat();
    this.available$.next(available);

    // Territories that are already sold after form filtering
    const soldTerms = getSoldTerms(this.availsForm.value, this.salesTerms); // @TODO #5573 unit test getSoldTerms
    const sold = soldTerms.map(term => term.territories
      .filter(t => !!territoriesISOA3[t])
      .map(territory => ({
        slug: territory,
        isoA3: territoriesISOA3[territory],
        label: territories[territory],
        contract: this.mandates.find(m => m.id === term.contractId),
        term,
      }))
    ).flat();
    this.sold$.next(sold);

  }

  clear() {
    this.availsForm.reset();
    this.available$.next([]);
  }

  /** Whenever you click on a territory, add it to availsForm.territories. */
  public select(territory: TerritoryMarker) {
    this.bucketForm.toggleTerritory(this.availsForm.value, territory);
  }

  public selectAll() {
    const available = this.available$.getValue();
    available.forEach(t => this.bucketForm.toggleTerritory(this.availsForm.value, t));
  }

  public trackByTag(tag) {
    return tag;
  }

  /** Display the territories information in the tooltip */
  public displayTerritoryTooltip(territory: TerritoryValue, status: string) {
    this.hoveredTerritory = { name: territory, status }
  }

  /** Clear the territories information */
  public clearTerritoryTooltip() {
    this.hoveredTerritory = null;
  }

  addLanguage(term: BucketTermForm) {
    const spec = createMovieLanguageSpecification({});
    term.controls.languages.addControl(this.languageCtrl.value, new VersionSpecificationForm(spec));
    this.languageCtrl.reset();
    this.showButtons = true;
  }

  deleteLanguage(term: BucketTermForm, language: Language) {
    term.controls.languages.removeControl(language);
  }

  addToSelection() {
    this.bucketService.update(this.orgId, this.bucketForm.value);
  }
}
