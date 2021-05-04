import { MovieQuery, Movie, createMovieLanguageSpecification } from '@blockframes/movie/+state';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { TerritoryValue, TerritoryISOA3Value, territoriesISOA3, territories, Language } from '@blockframes/utils/static-model';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService } from '@blockframes/organization/+state';
import { Observable } from 'rxjs';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { getMandateTerms } from '@blockframes/contract/avails/avails';
import { TermService } from '@blockframes/contract/term/+state';
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
  public notLicensedTerritories$: Observable<TerritoryMarker[]>;
  public rightsSoldTerritories$: Observable<TerritoryMarker[]>;
  public availableTerritories$: Observable<TerritoryMarker[]>;

  private mandates: Contract[];
  private sales: Contract[];

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

    const contracts = await this.contractService.getValue(ref => ref.where('titleId', '==', this.movie.id))
    this.mandates = contracts.filter(c => c.type === 'mandate');
    this.sales = contracts.filter(c => c.type === 'sale');
    this.bucket$ = this.bucketQuery.selectActive();
  }

  query() {
    if (this.form.invalid) {
      this.snackBar.open('Invalid form', '', { duration: 2000 });
      return;
    }

    // Territories available after form filtering 
    this.availableTerritories$ = this.termService.valueChanges(this.mandates.map(m => m.termIds).flat()).pipe(
      map(terms => {
        const mandateTerms = getMandateTerms(this.form.value, terms);

        let availableTerritories = [];
        mandateTerms.forEach(term => {
          availableTerritories = term.territories.filter(t => !!territoriesISOA3[t]).map(territory => {
            return {
              isoA3: territoriesISOA3[territory],
              label: territories[territory],
              contract: this.mandates.find(m => m.id === term.contractId)
            }
          });
        })
        return availableTerritories;
      })
    );


    // Territories that are already sold
    // @TODO #5573 use form values 
    this.rightsSoldTerritories$ = this.termService.valueChanges(this.sales.map(m => m.termIds).flat()).pipe(
      map(terms => {
        let availableTerritories = [];
        terms.forEach(term => {
          availableTerritories = term.territories.filter(t => !!territoriesISOA3[t]).map(territory => {
            return {
              isoA3: territoriesISOA3[territory],
              label: territories[territory],
              contract: this.mandates.find(m => m.id === term.contractId)
            }
          });
        })


        return availableTerritories;
      })
    );

    // Territories that are not under a mandate
    // @TODO #5573 usefull ? &  use form values 
    this.notLicensedTerritories$ = this.termService.valueChanges(this.mandates.map(m => m.termIds).flat()).pipe(
      map(terms => {
        const notSoldTerritories = terms.map(t => t.territories).flat();
        return Object.keys(territories)
          .filter(t => !notSoldTerritories.includes(t as any))
          .map(t => ({
            isoA3: territoriesISOA3[t],
            label: territories[t]
          })).filter(t => !!t.isoA3);
      })
    );

  }

  clear() {
    // @TODO #5573 also reset map
    this.form.reset();
  }

  public applyFilters() {
    // @TODO (#5655)
  }

  /** Whenever you click on a territory, add it to availsForm.territories. */
  public select(territory: TerritoryMarker) {
    console.log(territory);
  }

  /** Get a list of iso_a3 strings from the territories of the form. */
  // @TODO #5573 still usefull ?
  public get territoriesIsoA3(): string[] {
    return [];
  }

  public trackByTag(tag) {
    return tag;
  }

  /** Display the territories information in the tooltip */
  public dislpayTerritoryTooltip(territory: TerritoryValue, status: string) {
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
