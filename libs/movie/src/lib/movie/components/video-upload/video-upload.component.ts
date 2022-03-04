import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Privacy } from '@blockframes/utils/file-sanitizer';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Movie } from '@blockframes/data-model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { hostedVideoTypes } from '@blockframes/utils/static-model';
import { MovieVideosForm } from '@blockframes/movie/form/movie.form';
import { MovieVideos } from '@blockframes/data-model';
import { FileUploaderService } from '@blockframes/media/+state/file-uploader.service';

@Component({
  selector: 'movie-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieVideoUploadComponent implements OnInit {

  public form: MovieVideosForm;

  public filePrivacy: Privacy = 'protected';
  @Input() movie: Movie;
  public hostedVideoTypes = Object.keys(hostedVideoTypes);

  constructor(
    private snackBar: MatSnackBar,
    private uploaderService: FileUploaderService,
    private movieService: MovieService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = new MovieVideosForm();
  }

  async ngOnInit() {
    this.form = new MovieVideosForm(this.movie.promotional.videos);
    // Add empty upload zone
    this.form.otherVideos.add({ ref: '' });
    this.cdr.markForCheck();
  }

  public getPath(pathPart: 'screener' | 'otherVideos') {
    return `movies/${this.movie.id}/promotional.videos.${pathPart}`;
  }

  public addOtherVideo() {
    this.form.otherVideos.add({ ref: '' });
    this.cdr.markForCheck();
  }


  public async uploadVideo() { // @TODO #2586 should be done by shell component if component is not called from admin
    if (!this.form.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }

    const videos : MovieVideos = {
      ...this.form.value,
      otherVideos: this.form.otherVideos.value.filter(n => !!n.storagePath)
    };

    this.movie.promotional.videos = videos;
    this.uploaderService.upload();
    await this.movieService.update(this.movie.id, this.movie);

    this.snackBar.open('Videos upload started !', 'close', { duration: 5000 });
  }

}
