import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
export class MovieFormMediaVideosComponent implements OnInit {

  form = this.shell.getForm('movie');
  movieId = this.route.snapshot.params.movieId;
  currentOtherVideo: MovieHostedVideoForm;
  selectedOtherVideo: number;

  allowedFilesTypes = allowedFiles.video.mime;
  allowedFilesExtensions =  allowedFiles.video.extension;

  constructor(
    private shell: MovieFormShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Videos');

    if (!this.otherVideos.length) {
      this.otherVideos.add({ ref: '' });
    }
    this.selectedOtherVideo = 0;
    this.currentOtherVideo = this.otherVideos.at(this.selectedOtherVideo);
  }

  trackByIndex(index: number) { return index; }

  get screenerForm() {
    return this.form.promotional.videos.screener.ref;
  }

  get otherVideos() {
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
    this.otherVideos.add({ ref: '' });
    this.selectedOtherVideo = this.otherVideos.length - 1;
    this.currentOtherVideo = this.otherVideos.at(this.selectedOtherVideo);
    this.cdr.markForCheck();
  }

  selectOtherVideo(index: number) {
    if (index < 0 || index >= this.otherVideos.length) return;

    this.selectedOtherVideo = index;
    this.currentOtherVideo = this.otherVideos.at(this.selectedOtherVideo);
    this.cdr.markForCheck();
  }

  deleteOtherVideo(index: number) {
    if (index < 0 || index >= this.otherVideos.length) return;

    this.otherVideos.removeAt(index);
    if (!this.otherVideos.length) {
      this.otherVideos.add({ ref: '' });
    }
    this.selectedOtherVideo = 0;
    this.currentOtherVideo = this.otherVideos.at(this.selectedOtherVideo);
    this.cdr.markForCheck();
  }
}
