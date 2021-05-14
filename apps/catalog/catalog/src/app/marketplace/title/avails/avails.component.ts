
import { MatDialog } from '@angular/material/dialog';
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';

import { of, Subscription } from 'rxjs';

import { Scope } from '@blockframes/utils/static-model';
import { MovieQuery, Movie } from '@blockframes/movie/+state';
import { BucketForm, BucketTermForm } from '@blockframes/contract/bucket/form';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { BucketQuery, BucketService, BucketTerm } from '@blockframes/contract/bucket/+state';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';

import { ExplanationComponent } from './explanation/explanation.component';
import { switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormList } from '@blockframes/utils/form';


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

  private subs: Subscription[] = [];

  constructor(
    private movieQuery: MovieQuery,
    private orgQuery: OrganizationQuery,
    private bucketQuery: BucketQuery,
    private dialog: MatDialog,
    private bucketService: BucketService,
    private snackbar: MatSnackBar,
    private router: Router
  ) { }

  public async ngOnInit() {
    const sub = this.bucketQuery.selectActive().subscribe(bucket => {
      this.bucketForm.patchAllValue(bucket);
      this.bucketForm.change.next();
    });
    this.subs.push(sub);
  }

  public ngOnDestroy() {
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public addToSelection() {
    this.bucketService.update(this.orgId, this.bucketForm.value);
    this.bucketForm.markAsPristine();
    const ref = this.snackbar.open(`${this.movie.title.international} Rights were added to your Selection`, 'GO TO SELECTION', { duration: 5000 });
    const sub = ref.onAction().subscribe(() => this.router.navigate(['/c/o/marketplace/selection']));
    this.subs.push(sub);
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
      switchMap(exit => {
        /* Undefined means user clicked on the backdrop, meaning just close the modal */
        if (typeof exit === 'undefined') {
          return of(false);
        }
        return of(exit);
      })
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
