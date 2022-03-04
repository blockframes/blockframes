import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { MoviePictureCrmForm } from "@blockframes/admin/crm/forms/movie-crm.form";
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { Movie } from '@blockframes/data-model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { FileUploaderService } from '@blockframes/media/+state';

@Component({
  selector: 'movie-picture-upload',
  templateUrl: './picture-upload.component.html',
  styleUrls: ['./picture-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviePictureUploadComponent implements OnInit {
  @Input() movie: Movie;
  public moviePictureForm: MoviePictureCrmForm;

  constructor(
    private snackBar: MatSnackBar,
    private movieService: MovieService,
    private uploaderService: FileUploaderService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.moviePictureForm = new MoviePictureCrmForm(this.movie);
  }

  addStill() {
    this.moviePictureForm.get('still_photo').push(new StorageFileForm());
    this.cdr.markForCheck();
  }

  async uploadPicture() {
    if (!this.moviePictureForm.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }

    this.movie.poster = this.moviePictureForm.poster.value;
    this.movie.banner = this.moviePictureForm.banner.value;
    this.movie.promotional.still_photo = this.moviePictureForm.stillPhoto.value;

    this.uploaderService.upload();
    await this.movieService.update(this.movie.id, this.movie);
  }
}
