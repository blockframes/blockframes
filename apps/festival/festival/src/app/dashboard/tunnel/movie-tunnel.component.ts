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
  title: 'Summary',
  icon: 'document',
  routes: [{
    path: 'summary',
    label: 'Summary & Submission'
  }]
}];

@Component({
  selector: 'festival-movie-tunnel',
  templateUrl: './movie-tunnel.component.html',
  styleUrls: ['./movie-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieTunnelComponent implements TunnelRoot, OnInit {
  steps = steps;
  // Have to be initialized in the constructor as children page use it in the constructor too
  public form = new MovieForm(this.query.getActive());

  public bannerMediaForm = new HostedMediaForm(this.query.getActive().promotionalElements.banner.media.original);
  // TODO POSTER
  // TODO STILL PHOTO

  // TODO TRAILER
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
    if(this.form.invalid) {
      this.snackBar.open('It seems that one or more fields have an error. Please check your movie form and try again.', 'close', { duration: 5000 });
      return;
    }
    const movie: Movie = mergeDeep(this.query.getActive(), this.form.value);

    // console.log('XXX', movie);
    // console.log(this.presentationDeckMediaForm.value);
    // console.log(this.scenarioMediaForm.value);

    await this.service.save(movie);

    await this.mediaService.uploadOrDeleteMedia([
      this.bannerMediaForm,
      // TODO POSTER
      // TODO STILL PHOTO

      // TODO TRAILER
      this.presentationDeckMediaForm,
      this.scenarioMediaForm,
    ]);

    // TODO call upload on media service !!!

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
