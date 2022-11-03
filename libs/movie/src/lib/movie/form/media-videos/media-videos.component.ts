import { ActivatedRoute } from '@angular/router';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-media-videos',
  templateUrl: './media-videos.component.html',
  styleUrls: ['./media-videos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormMediaVideosComponent implements OnInit {
  form = this.shell.getForm('movie');
  movieId = this.route.snapshot.params.movieId;

  constructor(
    public shell: MovieFormShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Videos');
  }

  trackByIndex(index: number) {
    return index;
  }

  get salesPitchForm() {
    return this.form.promotional.videos.salesPitch;
  }

  get otherVideoForm() {
    return this.form.promotional.videos.otherVideo;
  }
}
