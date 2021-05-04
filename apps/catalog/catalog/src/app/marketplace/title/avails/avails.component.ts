import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MovieQuery, Movie, createMovieLanguageSpecification } from '@blockframes/movie/+state';
import { TerritoryValue, TerritoryISOA3Value, Language } from '@blockframes/utils/static-model';
import { Organization, OrganizationQuery, OrganizationService } from '@blockframes/organization/+state';
import { Observable, Subscription } from 'rxjs';
import { Bucket, BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';
import { BucketForm, BucketTermForm } from '@blockframes/contract/bucket/form';
import { VersionSpecificationForm } from '@blockframes/movie/form/movie.form';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';

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
export class MarketplaceMovieAvailsComponent implements OnInit, OnDestroy {
  public movie: Movie = this.movieQuery.getActive();
  public org$: Observable<Organization>;
  public orgId = this.orgQuery.getActiveId();
  public bucket$: Observable<Bucket>;
  public periods = ['weeks', 'months' ,'years'];
  private sub: Subscription;

  /** List of world map territories */
  public notLicensedTerritories: TerritoryMarker[] = [];
  public rightsSoldTerritories: TerritoryMarker[] = [];
  public availableTerritories: TerritoryMarker[] = [];

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
    private bucketQuery: BucketQuery,
    private bucketService: BucketService
  ) { }

  public ngOnInit() {
    this.org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);
    this.sub = this.bucketQuery.selectActive().subscribe(bucket => {
      this.bucketForm.patchAllValue(bucket);
      this.bucketForm.change.next();
    });
  }

  public ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public applyFilters() {
    // @TODO (#5655)
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
