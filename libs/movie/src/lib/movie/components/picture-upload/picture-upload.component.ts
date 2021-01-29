import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { MoviePictureAdminForm } from "@blockframes/admin/admin-panel/forms/movie-admin.form";
import { MediaService } from '@blockframes/media/+state/media.service';
import { extractMediaFromDocumentBeforeUpdate } from '@blockframes/media/+state/media.model';
import { Movie, MovieService } from '@blockframes/movie/+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HostedMediaForm } from '@blockframes/media/form/media.form';

@Component({
  selector: 'movie-picture-upload',
  templateUrl: './picture-upload.component.html',
  styleUrls: ['./picture-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviePictureUploadComponent implements OnInit {
  @Input() movie: Movie;
  public moviePictureForm: MoviePictureAdminForm;

  constructor(
    private snackBar: MatSnackBar,
    private movieService: MovieService,
    private mediaService: MediaService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.moviePictureForm = new MoviePictureAdminForm(this.movie);
  }

  addStill() {
    this.moviePictureForm.get('still_photo').push(new HostedMediaForm());
    this.cdr.markForCheck();
  }

  async uploadPicture() {
    if (!this.moviePictureForm.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }

    const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(this.moviePictureForm);

    this.movie.poster = documentToUpdate.poster;
    this.movie.banner = documentToUpdate.banner;
    this.movie.promotional.still_photo = documentToUpdate.still_photo;

    await this.movieService.update(this.movie.id, this.movie);
    this.mediaService.uploadMedias(mediasToUpload);
  }
}
