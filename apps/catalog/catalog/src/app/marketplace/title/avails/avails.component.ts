import { MovieQuery, Movie, createMovieLanguageSpecification } from '@blockframes/movie/+state';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { TerritoryValue, TerritoryISOA3Value, territoriesISOA3, territories, Language } from '@blockframes/utils/static-model';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService } from '@blockframes/organization/+state';
import { BehaviorSubject, Observable } from 'rxjs';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { getMandateTerms } from '@blockframes/contract/avails/avails';
import { Term, TermService } from '@blockframes/contract/term/+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
import { Bucket, BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';
import { BucketTermForm } from '@blockframes/contract/bucket/form';
import { FormControl } from '@angular/forms';
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
export class MarketplaceMovieAvailsComponent implements OnInit {
  public movie: Movie = this.movieQuery.getActive();
  public org$: Observable<Organization>;
  public bucket$: Observable<Bucket>;
  public periods = ['weeks', 'months', 'years'];

  /** List of world map territories */
  available$: Observable<TerritoryMarker[]>;
  sold$: Observable<TerritoryMarker[]>;
  selected$ = new BehaviorSubject<TerritoryMarker[]>([]); // The one in the bucket form

  private mandates: Contract[];
  private sales: Contract[];
  private mandateTerms$: Observable<Term<Date>[]>;
  private salesTerms$: Observable<Term<Date>[]>;

  public bucketForm = new BucketTermForm();
  /** Languages Form */
  public languageCtrl = new FormControl();
  public showButtons = true;

  public hoveredTerritory: {
    name: string;
    status: string;
  }

  public form = new AvailsForm({ territories: [] }, ['duration'])

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private contractService: ContractService,
    private termService: TermService,
    private snackBar: MatSnackBar,
    private bucketQuery: BucketQuery,
    private bucketService: BucketService
  ) { }

  public async ngOnInit() {

    this.org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);

    const contracts = await this.contractService.getValue(
      ref => ref.where('titleId', '==', this.movie.id)
        .where('status', '==', 'accepted')
    );
    this.mandates = contracts.filter(c => c.type === 'mandate');
    this.sales = contracts.filter(c => c.type === 'sale');
    this.bucket$ = this.bucketQuery.selectActive();

    this.mandateTerms$ = this.termService.valueChanges(this.mandates.map(m => m.termIds).flat());
    this.salesTerms$ = this.termService.valueChanges(this.sales.map(m => m.termIds).flat());

  }

  applyFilters() {
    if (this.form.invalid) {
      this.snackBar.open('Invalid form', '', { duration: 2000 });
      return;
    }

    // Territories available after form filtering 
    this.available$ = this.mandateTerms$.pipe(
      map(terms => {
        const mandateTerms = getMandateTerms(this.form.value, terms);

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
    this.form.reset();
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

  addLanguage() {
    const spec = createMovieLanguageSpecification({});
    this.bucketForm.get('languages').addControl(this.languageCtrl.value, new VersionSpecificationForm(spec));
    this.languageCtrl.reset();
    this.showButtons = true;
  }

  deleteLanguage(language: Language) {
    this.bucketForm.controls.languages.removeControl(language);
  }

  addToSelection() { }

}
