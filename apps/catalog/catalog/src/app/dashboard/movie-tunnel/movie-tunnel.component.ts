// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
// Blockframes
import { MovieService, MovieQuery, Movie } from '@blockframes/movie/+state';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TunnelStep, TunnelRoot, TunnelConfirmComponent } from '@blockframes/ui/tunnel';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { mergeDeep } from '@blockframes/utils/helpers';
import { MoviePromotionalElementsForm } from '@blockframes/movie/form/promotional-elements/promotional-elements.form';

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

  public exitRoute: string;

  constructor(
    private service: MovieService,
    private query: MovieQuery,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private storage: AngularFireStorage
  ) { }

  async ngOnInit() {
    this.exitRoute = `../../../titles/${this.query.getActiveId()}`;
  }

  // Should save movie
  public async save() {
    const movie = mergeDeep(this.query.getActive(), this.form.value);
    this.handleUpdatePromotionalImages(this.form.get('promotionalElements'), movie.promotionalElements);
    await this.service.update(movie);
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

  private async handleUpdatePromotionalImages(moviePromotionalElementsForm: MoviePromotionalElementsForm, promotionalElements) {

    const banner = moviePromotionalElementsForm.get('banner');
    const bannerMedia = banner.get('media');
    this.saveImage(bannerMedia, promotionalElements.banner.media);

    const posters = moviePromotionalElementsForm.get('poster');
    Object.keys(posters.controls).forEach(key => {
      const poster = posters.get(key);
      const posterMedia = poster.get('media');
      this.saveImage(posterMedia, promotionalElements.poster[key].media);
    });

    const still_photos = moviePromotionalElementsForm.get('still_photo');
    Object.keys(still_photos.controls).forEach(key => {
      console.log('still photo key: ', key)
      const still_photo = still_photos.get(key);
      const still_photoMedia = still_photo.get('media');
      this.saveImage(still_photoMedia, promotionalElements.still_photo[key].media);
    });

  }

  private saveImage(imageForm, mediaData) {

    const blob = imageForm.blob.value;
    const ref = imageForm.ref.value;
    const newRef = imageForm.newRef.value;

    if (imageForm.delete.value) {
      this.storage.ref(ref).delete();
      imageForm.get('ref').setValue('');
    } else if (!!blob) {
      if (ref !== '') {
        this.storage.ref(ref).delete();
      }
      this.storage.ref(newRef).put(blob);
      imageForm.ref.setValue(newRef);
    }

    imageForm.blob.setValue('');
    imageForm.newRef.setValue('');
    imageForm.delete.setValue(false);

    delete mediaData.blob;
    delete mediaData.newRef;
    delete mediaData.delete;

  }
}
