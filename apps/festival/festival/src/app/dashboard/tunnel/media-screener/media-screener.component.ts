import { ActivatedRoute } from '@angular/router';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';

@Component({
  selector: 'movie-form-media-screener',
  templateUrl: './media-screener.component.html',
  styleUrls: ['./media-screener.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormMediaScreenerComponent implements OnInit {
  form = this.shell.getForm('movie');
  movieId = this.route.snapshot.params.movieId;

  constructor(
    private shell: MovieFormShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.dynTitle.setPageTitle('Screener Video');
  }

  get screenerForm() {
    return this.form.promotional.videos.screener;
  }
}