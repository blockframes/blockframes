import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'movie-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent implements OnInit {

  public movie$ = this.movieQuery.selectActive();
  public loading$ = this.movieQuery.selectLoading();

  constructor(
    private movieQuery: MovieQuery,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Film Page', 'Main Info');
  }

  public hasStory({ synopsis, keywords, keyAssets }: Movie): boolean {
    return !!(synopsis || keywords.length > 0 || keyAssets);
  }

}
