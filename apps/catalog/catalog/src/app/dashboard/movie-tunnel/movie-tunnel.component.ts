// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
// Blockframes
import { MovieService, MovieQuery, Movie } from '@blockframes/movie/+state';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TunnelStep, TunnelRoot, TunnelConfirmComponent } from '@blockframes/ui/tunnel';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { mergeDeep } from '@blockframes/utils/helpers';
import { HostedMediaForm } from '@blockframes/media/directives/media/media.form';
import { FormGroup } from '@angular/forms';
import { MediaService } from '@blockframes/media/+state/media.service';

const steps: TunnelStep[] = [{
  title: 'Title Information',
  icon: 'document',
  time: 15,
  routes: [{
    path: 'main',
    label: 'Main Information'
  }, {
    path: 'synopsis',
    label: 'Storyline Elements'
  }, {
    path: 'credits',
    label: 'Credits'
  }, {
    path: 'budget',
    label: 'Budget, Quotas, Critics',
  }]
}, {
  title: 'Media',
  icon: 'import',
  time: 10,
  routes: [{
    path: 'technical-info',
    label: 'Technical Information'
  }, {
    path: 'images',
    label: 'Promotional Images'
  }, {
    path: 'files&links',
    label: 'Files & Links'
  }]
}, {
  title: 'Legal Information',
  icon: 'certificate',
  time: 5,
  routes: [{
    path: 'chain',
    label: 'Chain of Titles'
  }, {
    path: 'evaluation',
    label: 'Marketplace Eval.'
  }]
}, {
  title: 'Summary',
  icon: 'document',
  routes: [{
    path: 'summary',
    label: 'Summary & Submission'
  }]
}];

@Component({
  selector: 'catalog-movie-tunnel',
  templateUrl: './movie-tunnel.component.html',
  styleUrls: ['./movie-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieTunnelComponent implements TunnelRoot, OnInit {
  steps = steps;
  // Have to be initialized in the constructor as children page use it in the constructor too
  public form = new MovieForm(this.query.getActive());

  public bannerMediaForm = new HostedMediaForm(this.query.getActive().promotionalElements.banner.media.original);
  public posterMediaForms = new FormGroup({
    '0': new HostedMediaForm(this.query.getActive().promotionalElements.poster['0'].media.original),
  });

  public stillPhotoMediaForms = new FormGroup({
    '0': new HostedMediaForm(this.query.getActive().promotionalElements.still_photo['0'].media.original),
  });

  public presentationDeckMediaForm = new HostedMediaForm(this.query.getActive().promotionalElements.presentation_deck.media);
  public scenarioMediaForm = new HostedMediaForm(this.query.getActive().promotionalElements.scenario.media);

  public exitRoute: string;

  constructor(
    private service: MovieService,
    private query: MovieQuery,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private mediaService: MediaService,
  ) { }

  async ngOnInit() {
    this.exitRoute = `../../../title/${this.query.getActiveId()}`;
  }

  // Should save movie
  public async save() {
    const movie: Movie = mergeDeep(this.query.getActive(), this.form.value);

    await this.service.save(movie);

    await this.mediaService.uploadOrDeleteMedia([
      this.bannerMediaForm,

      ...Object.keys(this.posterMediaForms.controls).map(key => this.posterMediaForms.get(key) as HostedMediaForm),
      ...Object.keys(this.stillPhotoMediaForms.controls).map(key => this.stillPhotoMediaForms.get(key) as HostedMediaForm),

      this.presentationDeckMediaForm,
      this.scenarioMediaForm,
    ]);

    this.form.markAsPristine();
    await this.snackBar.open('Title saved', '', { duration: 500 }).afterDismissed().toPromise();
    return true;
  }

  confirmExit() {
    if (this.form.pristine) {
      return of(true);
    }
    const dialogRef = this.dialog.open(TunnelConfirmComponent, {
      width: '80%',
      data: {
        title: 'You are going to leave the Movie Form.',
        subtitle: 'Pay attention, if you leave now your changes will not be saved.'
      }
    });
    return dialogRef.afterClosed().pipe(
      switchMap(shouldSave => shouldSave ? this.save() : of(false))
    );
  }

}
