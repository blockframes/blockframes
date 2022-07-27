import { ActivatedRoute } from '@angular/router';
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieFormShellComponent } from '../shell/shell.component';
import { MovieService } from '../../service';
import { getFileMetadata, getFileStoragePath } from '@blockframes/media/utils';
import { getDeepValue } from '@blockframes/utils/pipes';
import { Subscription } from 'rxjs';
import { MovieVideo } from '@blockframes/model';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { getFileListIndex } from '@blockframes/media/file/pipes/file-list.pipe';

@Component({
  selector: 'movie-form-media-videos',
  templateUrl: './media-videos.component.html',
  styleUrls: ['./media-videos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormMediaVideosComponent implements OnInit, OnDestroy {
  form = this.shell.getForm('movie');
  movieId = this.route.snapshot.params.movieId;

  private sub: Subscription;

  constructor(
    private movie: MovieService,
    private shell: MovieFormShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private uploaderService: FileUploaderService
  ) {}

  ngOnInit() {
    this.dynTitle.setPageTitle('Videos');

    this.sub = this.movie.valueChanges(this.movieId).subscribe((title) => {
      const metadata = getFileMetadata('movies', 'otherVideos', this.movieId);
      const mediaArray: Partial<MovieVideo>[] = getDeepValue(title, metadata.field);
      this.videoList.patchValue(mediaArray);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  trackByIndex(index: number) {
    return index;
  }

  get salesPitchForm() {
    return this.form.promotional.videos.salesPitch;
  }

  get videoList() {
    return this.form.promotional.videos.otherVideos;
  }

  removeFromQueue(index: number) {
    const storagePath = getFileStoragePath('movies', 'otherVideos', this.movieId);
    const queueIndex = getFileListIndex(index, this.videoList.value);
    this.uploaderService.removeFromQueue(storagePath, queueIndex);
  }
}
