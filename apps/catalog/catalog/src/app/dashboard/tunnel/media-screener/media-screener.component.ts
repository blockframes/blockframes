import { ActivatedRoute } from '@angular/router';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { supportEmails } from '@env';

@Component({
  selector: 'movie-form-media-screener',
  templateUrl: './media-screener.component.html',
  styleUrls: ['./media-screener.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormMediaScreenerComponent implements OnInit {
  form = this.shell.getForm('movie');
  movieId = this.route.snapshot.params.movieId;

  supportEmail = supportEmails.catalog;

  constructor(
    public shell: MovieFormShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.dynTitle.setPageTitle('Screener Video');
  }

  get publicScreenerForm() {
    return this.form.promotional.videos.publicScreener;
  }
}
