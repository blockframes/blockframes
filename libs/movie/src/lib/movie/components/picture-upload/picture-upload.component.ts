import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { MoviePictureAdminForm } from "@blockframes/admin/admin-panel/forms/movie-admin.form";
import { MediaService } from '@blockframes/media/+state/media.service';
import { extractMediaFromDocumentBeforeUpdate } from '@blockframes/media/+state/media.model';
import { Movie, MovieService } from '@blockframes/movie/+state';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    // this.moviePictureForm.still_photos.add({ ref: '' });
    console.log(this.moviePictureForm)
    this.cdr.markForCheck();
  }

  async uploadPicture() {
    if (!this.moviePictureForm.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }

    const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(this.moviePictureForm);

    const pictures = {
      ...documentToUpdate,
      poster: documentToUpdate.poster,
      banner: documentToUpdate.banner,
      still_photos: documentToUpdate.still_photos.filter(n => !!n.ref)
    };

    this.movie.poster = pictures.poster;
    this.movie.banner = pictures.banner;
    this.movie.promotional.still_photo = pictures.still_photos;

    await this.movieService.update(this.movie.id, this.movie);
    this.mediaService.uploadMedias(mediasToUpload);
  }
}
