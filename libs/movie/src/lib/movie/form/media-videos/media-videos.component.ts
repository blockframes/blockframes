import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { getFileNameFromPath } from '@blockframes/media/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { allowedFiles } from '@blockframes/utils/utils';
import { MovieFormShellComponent } from '../shell/shell.component';
import { MovieHostedVideoForm } from '../movie.form';

@Component({
  selector: 'movie-form-media-videos',
  templateUrl: './media-videos.component.html',
  styleUrls: ['./media-videos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaVideosComponent implements OnInit, OnDestroy {

  form = this.shell.getForm('movie');
  movieId = this.route.snapshot.params.movieId;
  activeVideo = new MovieHostedVideoForm();
  activeVideoIndex: number;

  allowedFilesTypes = allowedFiles.video.mime;
  allowedFilesExtensions =  allowedFiles.video.extension;

  private sub: Subscription;

  constructor(
    private shell: MovieFormShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Videos');

    if (!this.videoList.length) {
      this.videoList.add({ ref: '' });
    }
    this.activeVideoIndex = 0;
    this.activeVideo.patchValue(this.videoList.at(this.activeVideoIndex).value);

    this.sub = this.activeVideo.valueChanges.subscribe(value => {
      this.videoList.at(this.activeVideoIndex).patchValue(value);
    })
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

  getPath(pathPart: string) {
    return `movies/${this.movieId}/promotional.videos/${pathPart}`;
  }

  addOtherVideo() {
    this.videoList.add({ ref: '' });
    this.activeVideoIndex = this.videoList.length - 1;
    this.activeVideo.patchValue(this.videoList.at(this.activeVideoIndex).value);
    this.cdr.markForCheck();
  }

  selectOtherVideo(index: number) {
    if (index < 0 || index >= this.videoList.length) return;

    this.activeVideoIndex = index;
    this.activeVideo.patchValue(this.videoList.at(this.activeVideoIndex).value);
    this.cdr.markForCheck();
  }

  deleteOtherVideo(index: number) {
    if (index < 0 || index >= this.videoList.length) return;

    this.videoList.removeAt(index);
    if (!this.videoList.length) {
      this.videoList.add({ ref: '' });
    }
    this.activeVideoIndex = 0;
    this.activeVideo.patchValue(this.videoList.at(this.activeVideoIndex).value);
    this.cdr.markForCheck();
  }
}
