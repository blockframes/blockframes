import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { TitleMarketplaceShellComponent } from '../shell/shell.component';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';

@Component({
  selector: 'movie-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent implements OnInit {
  public movie$ = this.shell.movie$;
  public status: Record<string, Movie['productionStatus'][]> = {
    afterProd: ['post_production', 'finished', 'released']
  };
  public keys: Record<string, (keyof Movie)[]> = {
    main: ['logline', 'synopsis', 'keywords'],
    general: ['release', 'originCountries', 'originalLanguages', 'genres', 'runningTime'],
    prizes: ['prizes', 'review']
  }
  private alreadyPlayed = false;

  constructor(
    private shell: TitleMarketplaceShellComponent,
    private dynTitle: DynamicTitleService,
    private analytics: FireAnalytics,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Film Page', 'Main Info');
  }

  showSalesPitch(movie: Movie) {
    if (!movie.promotional?.videos?.salesPitch) return false;
    const { privacy, jwPlayerId, description } = movie.promotional.videos.salesPitch;
    return privacy === 'public' && (jwPlayerId || description);
  }

  videoStateChanged(movieId: string, event: string) {
    if (event === 'play' && !this.alreadyPlayed) {
      this.analytics.event('promoReelOpened', { movieId });
      this.alreadyPlayed = true;
    }
  }

}
