import { MovieQuery, Movie, createMovieLanguageSpecification } from '@blockframes/movie/+state';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { TerritoryValue, TerritoryISOA3Value, Language } from '@blockframes/utils/static-model';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService } from '@blockframes/organization/+state';
import { Observable } from 'rxjs';
import { Bucket, BucketQuery } from '@blockframes/contract/bucket/+state';
import { FormControl } from '@angular/forms';
import { VersionSpecificationForm, MovieVersionInfoForm } from '@blockframes/movie/form/movie.form';

interface TerritoryMarker {
  isoA3: TerritoryISOA3Value,
  label: TerritoryValue
}

interface TerritoryMarker {
  isoA3: TerritoryISOA3Value,
  label: TerritoryValue
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

  /** List of world map territories */
  public notLicensedTerritories: TerritoryMarker[] = [];
  public rightsSoldTerritories: TerritoryMarker[] = [];
  public availableTerritories: TerritoryMarker[] = [];

  /** Languages Form */
  public languageCtrl = new FormControl();
  public showButtons = true;
  public languageForm = new MovieVersionInfoForm();

  public hoveredTerritory: {
    name: string;
    status: string;
  }

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private bucketQuery: BucketQuery
  ) { }

  public async ngOnInit() {
    this.org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);
    this.bucket$ = this.bucketQuery.selectActive();
    this.languageForm.valueChanges.subscribe(value => {
      console.log(value)
    })
  }

  /** Whenever you click on a territory, add it to availsForm.territories. */
  public select(territory: any) { // @TODO #5573 find correct typing
    console.log(territory);
  }

  /** Get a list of iso_a3 strings from the territories of the form. */
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
    this.languageForm.addControl(this.languageCtrl.value, new VersionSpecificationForm(spec));
    this.languageCtrl.reset();
    this.showButtons = true;
  }

  deleteLanguage(language: Language) {
    this.languageForm.removeControl(language);
  }

  showForm() {
    this.showButtons = !this.showButtons
  }

}
