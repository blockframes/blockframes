// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
// Blockframes
import { MovieService, MovieQuery, Movie, PromotionalElement } from '@blockframes/movie/+state';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TunnelStep, TunnelRoot, TunnelConfirmComponent } from '@blockframes/ui/tunnel';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { mergeDeep } from '@blockframes/utils/helpers';
import { MoviePromotionalElementsForm } from '@blockframes/movie/form/promotional-elements/promotional-elements.form';
import { MediaService } from '@blockframes/utils/media/media.service';

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

  public exitRoute: string;

  constructor(
    private service: MovieService,
    private query: MovieQuery,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private media: MediaService
  ) { }

  async ngOnInit() {
    this.exitRoute = `../../../title/${this.query.getActiveId()}`;
  }

  // Should save movie
  public async save() {
    const movie: Movie = mergeDeep(this.query.getActive(), this.form.value);
    await this.service.save(movie);
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

  private async uploadMedias(movieData: Movie, movieForm: MovieForm) {
    
    const mediaPaths = movieForm.get('promotionalElements').mediaPaths;
    
    const result = this.media.extractMediaForm(movieForm, mediaPaths);

    const values = result[0];
    const extractedForms = result[1];

    this.media.handleMediaForm(extractedForms);

  }

  private removePaths(movieData: Movie) {
    const promotionalElements = movieData.promotionalElements;
    this.remove(promotionalElements.banner.media)
    promotionalElements.poster.forEach(poster => this.remove(poster.media))
    promotionalElements.still_photo.forEach(still_photo => this.remove(still_photo.media))
  }

  private remove(mediaData) {
    delete mediaData.delete;
    delete mediaData.blob;
    delete mediaData.newRef;
  }

}
