import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { createMovieVideo, Movie, Privacy, ScreenerType } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { MovieVideosForm } from '@blockframes/movie/form/movie.form';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';

@Component({
  selector: 'movie-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieVideoUploadComponent implements OnInit {
  public form: MovieVideosForm;

  @Input() movie: Movie;

  constructor(
    private snackBar: MatSnackBar,
    private uploaderService: FileUploaderService,
    private movieService: MovieService,
  ) {
    this.form = new MovieVideosForm();
  }

  ngOnInit() {
    this.form = new MovieVideosForm(this.movie.promotional.videos);
  }

  public async uploadVideo() {
    if (!this.form.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }

    this.movie.promotional.videos = this.form.value;
    this.uploaderService.upload();
    await this.movieService.update(this.movie.id, this.movie);

    this.snackBar.open('Videos update started !', 'close', { duration: 5000 });
  }

  public hasScreener(type: ScreenerType) {
    return !!this.movie.promotional.videos && !!this.movie.promotional.videos[type]?.storagePath;
  }

  public copyScreener(fromType: ScreenerType, toType: ScreenerType) {
    const privacy: Privacy = toType === 'publicScreener' ? 'public' : 'protected';
    this.movie.promotional.videos[toType] = createMovieVideo({ ...this.movie.promotional.videos[fromType], privacy });

    this.snackBar.open(`${fromType} copied to ${toType}! Click update to validate.`, 'close', { duration: 5000 });
    this.form.reset(this.movie.promotional.videos);
  }
}
