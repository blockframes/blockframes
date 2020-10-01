import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Privacy } from '@blockframes/utils/file-sanitizer';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MediaService } from '@blockframes/media/+state/media.service';
import { HostedVideos } from '@blockframes/movie/+state/movie.firestore';
import { Movie, MovieService } from '@blockframes/movie/+state';
import { MovieHostedVideosForm } from '@blockframes/movie/form/movie.form';
import { extractMediaFromDocumentBeforeUpdate } from '@blockframes/media/+state/media.model';
import { staticConsts } from '@blockframes/utils/static-model';

@Component({
  selector: 'movie-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieVideoUploadComponent implements OnInit {

  public form: MovieHostedVideosForm;
  public filePrivacy: Privacy = 'protected';
  @Input() movie: Movie;
  public allowedFilesTypes = ['video/x-msvideo', 'video/x-matroska', 'video/mp4'];
  public allowedFilesExtensions =  ['.avi', '.mkv', '.mp4'];
  public hostedVideoTypes = Object.keys(staticConsts['hostedVideoTypes']);

  constructor(
    private snackBar: MatSnackBar,
    private mediaService: MediaService,
    private movieService: MovieService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = new MovieHostedVideosForm();
  }

  async ngOnInit() {
    this.form = new MovieHostedVideosForm(this.movie.promotional.videos);

    // Add empty upload zone
    this.form.otherVideos.add({ ref: '' });
    this.cdr.markForCheck();
  }

  public getPath(pathPart: string) {
    return `movies/${this.movie.id}/promotional.videos/${pathPart}`;
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

    const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(this.form);

    const videos : HostedVideos = {
      ...documentToUpdate,
      otherVideos: documentToUpdate.otherVideos.filter(n => !!n.ref)
    };

    this.movie.promotional.videos = videos;
    await this.movieService.update(this.movie.id, this.movie);

    this.mediaService.uploadMedias(mediasToUpload);
    this.snackBar.open('Videos upload started !', 'close', { duration: 5000 });
  }

}
