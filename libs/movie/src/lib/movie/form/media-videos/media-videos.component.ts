
import { ActivatedRoute } from '@angular/router';
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';

import { hostedVideoTypes } from '@blockframes/utils/static-model/static-model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-media-videos',
  templateUrl: './media-videos.component.html',
  styleUrls: ['./media-videos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaVideosComponent implements OnInit {

  form = this.shell.getForm('movie');
  movieId = this.route.snapshot.params.movieId;

  videoTypes = Object.keys(hostedVideoTypes);

  constructor(
    private shell: MovieFormShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Videos');
  }

  trackByIndex(index: number) { return index; }

  get screenerForm() {
    return this.form.promotional.videos.screener;
  }

  get videoList() {
    return this.form.promotional.videos.otherVideos;
  }

  get hasScreener() {
    return !!this.screenerForm.storagePath.value;
  }

  deleteScreener() {
    this.screenerForm.patchValue({ storagePath: '' })
    this.screenerForm.markAsDirty();
    this.cdr.markForCheck();
  }
}
