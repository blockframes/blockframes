import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MovieQuery, Movie, createMovieLanguageSpecification } from '@blockframes/movie/+state';
import { TerritoryValue, TerritoryISOA3Value, territoriesISOA3, territories, Language } from '@blockframes/utils/static-model';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService, OrganizationQuery } from '@blockframes/organization/+state';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { getMandateTerms } from '@blockframes/contract/avails/avails';
import { Term, TermService } from '@blockframes/contract/term/+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
import { Bucket, BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';
import { BucketTermForm, BucketForm } from '@blockframes/contract/bucket/form';
import { VersionSpecificationForm } from '@blockframes/movie/form/movie.form';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';

interface TerritoryMarker {
  isoA3: TerritoryISOA3Value,
  label: TerritoryValue
  contract?: Contract,
}

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
  public periods = ['weeks', 'months' ,'years'];
  private sub: Subscription;

  /** List of world map territories */
  available$: Observable<TerritoryMarker[]>;
  sold$: Observable<TerritoryMarker[]>;
  selected$ = new BehaviorSubject<TerritoryMarker[]>([]); // The one in the bucket form

  private mandates: Contract[];
  private sales: Contract[];
  private mandateTerms$: Observable<Term<Date>[]>;
  private salesTerms$: Observable<Term<Date>[]>;

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

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private orgQuery: OrganizationQuery,
    private contractService: ContractService,
    private termService: TermService,
    private snackBar: MatSnackBar,
    private bucketQuery: BucketQuery,
    private bucketService: BucketService
  ) { }

  public async ngOnInit() {
    this.org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);

    this.sub = this.bucketQuery.selectActive().subscribe(bucket => {
      this.bucketForm.patchAllValue(bucket);
      this.bucketForm.change.next();
    });

    const contracts = await this.contractService.getValue(
      ref => ref.where('titleId', '==', this.movie.id)
        .where('status', '==', 'accepted')
    );
    this.mandates = contracts.filter(c => c.type === 'mandate');
    this.sales = contracts.filter(c => c.type === 'sale');
    this.mandateTerms$ = this.termService.valueChanges(this.mandates.map(m => m.termIds).flat());
    this.salesTerms$ = this.termService.valueChanges(this.sales.map(m => m.termIds).flat());
  }

  public ngOnDestroy() {
    this.sub.unsubscribe();
  }

  applyFilters() {
    if (this.availsForm.invalid) {
      this.snackBar.open('Invalid form', '', { duration: 2000 });
      return;
    }

    // Territories available after form filtering
    this.available$ = this.mandateTerms$.pipe(
      map(terms => {
        const mandateTerms = getMandateTerms(this.availsForm.value, terms);
        return mandateTerms.map(term => term.territories
          .filter(t => !!territoriesISOA3[t])
          .map(territory => ({
            isoA3: territoriesISOA3[territory],
            label: territories[territory],
            contract: this.mandates.find(m => m.id === term.contractId)
          }))
        ).flat();
      })
    );

    // Territories that are already sold
    // @TODO #5573 use form values
    this.sold$ = this.salesTerms$.pipe(
      map(terms => {
        return terms.map(term => term.territories
          .filter(t => !!territoriesISOA3[t])
          .map(territory => ({
            isoA3: territoriesISOA3[territory],
            label: territories[territory],
            contract: this.mandates.find(m => m.id === term.contractId)
          }))
        ).flat();
      })
    );

  }

  clear() {
    // @TODO #5573 also reset map
    this.availsForm.reset();
  }

  /** Whenever you click on a territory, add it to availsForm.territories. */
  public select(territory: TerritoryMarker) {
    const selected = this.selected$.getValue();

    if (selected.find(s => s.isoA3 === territory.isoA3)) {
      this.selected$.next(selected.filter(s => s.isoA3 !== territory.isoA3));
    } else {
      selected.push(territory);
      this.selected$.next(selected);
    }
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
