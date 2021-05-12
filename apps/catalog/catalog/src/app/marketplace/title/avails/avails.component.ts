
import { MatDialog } from '@angular/material/dialog';
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { Scope } from '@blockframes/utils/static-model';
import { MovieQuery, Movie } from '@blockframes/movie/+state';
import { BucketForm } from '@blockframes/contract/bucket/form';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';

import { ExplanationComponent } from './explanation/explanation.component';


@Component({
  selector: 'catalog-movie-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieAvailsComponent implements OnInit, OnDestroy {
  public movie: Movie = this.movieQuery.getActive();

  public orgId = this.orgQuery.getActiveId();
  public periods = ['weeks', 'months', 'years'];
  public maxTerritories = 30;

  public bucketForm = new BucketForm();

  public avails = {
    mapForm: new AvailsForm({ territories: [] }, ['duration']),
    calendarForm: new AvailsForm({ territories: [] }, ['territories']),
  };

  public terms$ = this.bucketForm.selectTerms(this.movie.id);

  private sub: Subscription;

  constructor(
    private movieQuery: MovieQuery,
    private orgQuery: OrganizationQuery,
    private bucketQuery: BucketQuery,
    private dialog: MatDialog,
    private bucketService: BucketService
  ) { }

  public async ngOnInit() {
    this.sub = this.bucketQuery.selectActive().subscribe(bucket => {
      this.bucketForm.patchAllValue(bucket);
      this.bucketForm.change.next();
    });
  }

  public ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public addToSelection() {
    this.bucketService.update(this.orgId, this.bucketForm.value);
    this.bucketForm.markAsPristine();
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
}
