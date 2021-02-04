import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileMetaData } from '@blockframes/media/+state/media.model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { hostedVideoTypes } from '@blockframes/utils/static-model/static-model';
import { MovieFormShellComponent } from '../shell/shell.component';
import { Movie, MovieQuery } from '../../+state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'movie-form-media-videos',
  templateUrl: './media-videos.component.html',
  styleUrls: ['./media-videos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaVideosComponent implements OnInit { // , OnDestroy {

  public form = this.shell.getForm('movie');
  public movieId = this.route.snapshot.params.movieId;

  public storagePaths: Record<string, string> = {
    screener: `protected/movies/${this.movieId}/screener`,
    otherVideos: `protected/movies/${this.movieId}/otherVideos`,
  };

  // public metaDatas: Record<string, (FileMetaData)> = {
  public screenerMetaData: FileMetaData = {
    privacy: 'protected',
    collection: 'movies',
    docId: this.movieId,
    field: 'promotional.videos.screener',
    uid: '',
  };

  public videoTypes = Object.keys(hostedVideoTypes);

  // private sub: Subscription;

  constructor(
    private shell: MovieFormShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    // private movieQuery: MovieQuery,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Videos');
    // when ensure to keep the latest JwPlayerId because backend can takes some time to update it into the db
    // without this subscribe block we had trouble with user overwriting the JwPlayerId with stale values
    // this.sub = this.movieQuery.selectActive().subscribe((movie: Movie) => {

    //   console.log(this.form.promotional.videos);

    //   if (this.form.promotional.videos.screener.get('jwPlayerId')?.value !== '') {
    //     const latestJwPlayerId = movie.promotional.videos.screener.jwPlayerId;
    //     this.form.promotional.videos.screener.patchValue({
    //       jwPlayerId: latestJwPlayerId,
    //     });
    //   }

    //   this.form.promotional.videos.otherVideos.controls.forEach(otherVideoControl => {
    //     console.log(otherVideoControl);
    //     if (otherVideoControl.get('jwPlayerId')?.value !== '') {
    //       const latestJwPlayerId = movie.promotional.videos.otherVideos?.find(movieOtherVideo =>
    //         movieOtherVideo.storagePath === otherVideoControl.get('storagePath')?.value
    //       )?.jwPlayerId;
    //       otherVideoControl.get('jwPlayerId')?.setValue(latestJwPlayerId);
    //     }
    //   });
    // });
  }

  // ngOnDestroy() {
  //   this.sub.unsubscribe();
  // }

  otherVideosMetaData(index: number) {
    return {
      privacy: 'public',
      collection: 'movies',
      docId: this.movieId,
      field: `promotional.videos.otherVideos[${index}]`,
      uid: '',
    }
  };

  trackByIndex(index: number) { return index; }

  get screenerForm() {
    return this.form.promotional.videos.screener;
  }

  get videoList() {
    return this.form.promotional.videos.otherVideos;
  }

  get hasScreener() {
    return !!this.screenerForm.get('storagePath').value;
  }

  deleteScreener() {
    this.screenerForm.patchValue({ storagePath: '' });
    this.screenerForm.markAsDirty();
    this.cdr.markForCheck();
  }

  // getPath(pathPart: 'screener' | 'otherVideos') {
  //   return `movies/${this.movieId}/promotional.videos.${pathPart}`;
  // }
}
