import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Privacy } from '@blockframes/utils/file-sanitizer';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MediaService } from '@blockframes/media/+state/media.service';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { MovieDocument } from '@blockframes/movie/+state/movie.firestore';
import { Movie, MovieService } from '@blockframes/movie/+state';
import { mergeDeep } from '@blockframes/utils/helpers';

@Component({
  selector: 'movie-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieVideoUploadComponent implements OnInit {

  public form: HostedMediaForm;
  public filePrivacy: Privacy = 'protected';
  @Input() movie: MovieDocument;

  constructor(
    private snackBar: MatSnackBar,
    private mediaService: MediaService,
    private movieService: MovieService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = new HostedMediaForm();
  }

  async ngOnInit() {
    this.form = new HostedMediaForm(this.movie.screening.video);
    this.cdr.markForCheck();
  }

  public getPath() {
    return `movies/${this.movie.id}/screening/video`;
  }

  public async uploadVideo() {
    if (!this.form.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }

    const screening = { video: `${this.form.value.ref}/${this.form.value.fileName}`, jwPlayerId: ''};
    const movie: Movie = mergeDeep(this.movie, { screening });
    console.log(movie);
    await this.movieService.update(movie.id, movie);


    this.mediaService.uploadMedias([this.form.value]);
    this.snackBar.open('Video uploaded !', 'close', { duration: 5000 });
  }

}
