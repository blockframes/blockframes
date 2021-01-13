import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFileNameFromPath } from '@blockframes/media/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { allowedFiles } from '@blockframes/utils/utils';
import { hostedVideoTypes } from '@blockframes/utils/static-model/static-model';
import { MovieFormShellComponent } from '../shell/shell.component';
import { MovieQuery } from '../../+state';
import { Subscription } from 'rxjs';
import { MovieHostedVideoControls } from '../movie.form';

@Component({
  selector: 'movie-form-media-videos',
  templateUrl: './media-videos.component.html',
  styleUrls: ['./media-videos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaVideosComponent implements OnInit, OnDestroy {

  form = this.shell.getForm('movie');
  movieId = this.route.snapshot.params.movieId;

  allowedFilesTypes = allowedFiles.video.mime;
  allowedFilesExtensions =  allowedFiles.video.extension;

  videoTypes = Object.keys(hostedVideoTypes);

  private sub: Subscription;

  constructor(
    private shell: MovieFormShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private movieQuery: MovieQuery,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Videos');
    // when ensure to keep the latest JwPlayerId because backend can takes some time to update it into the db
    // without this subscribe block we had trouble with user overwriting the JwPlayerId with stale values
    this.sub = this.movieQuery.selectActive().subscribe(movie => {
      if (this.form.promotional.videos.screener.jwPlayerId.value !== '') {
        const latestJwPlayerId = movie.promotional.videos.screener.jwPlayerId;
        this.form.promotional.videos.screener.patchValue({
          jwPlayerId: latestJwPlayerId,
        });
      }
      this.form.promotional.videos.otherVideos.controls.forEach((otherVideoControl: MovieHostedVideoControls) => {
        if (otherVideoControl.jwPlayerId.value !== '') {
          const latestJwPlayerId = movie.promotional.videos.otherVideos.find(movieOtherVideo =>
            movieOtherVideo.ref === otherVideoControl.ref.ref.value
          ).jwPlayerId;
          console.log('update', latestJwPlayerId);
          otherVideoControl.jwPlayerId.setValue(latestJwPlayerId);
        }
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  trackByIndex(index: number) { return index; }

  get screenerForm() {
    return this.form.promotional.videos.screener.ref;
  }

  get videoList() {
    return this.form.promotional.videos.otherVideos;
  }

  get hasScreener() {
    return !!this.screenerForm.ref.value;
  }

  deleteScreener() {
    this.screenerForm.patchValue({
      ref: '',
      blobOrFile: undefined,
      fileName: !!this.screenerForm.oldRef.value ? getFileNameFromPath(this.screenerForm.oldRef.value) : '',
    })
    this.screenerForm.markAsDirty();
    this.cdr.markForCheck();
  }

  getPath(pathPart: 'screener' | 'otherVideos') {
    return `movies/${this.movieId}/promotional.videos.${pathPart}`;
  }
}
