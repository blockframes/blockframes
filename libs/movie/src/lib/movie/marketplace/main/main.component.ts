import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { TitleMarketplaceShellComponent } from '../shell/shell.component';
import { Movie, MovieVideo } from '@blockframes/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { AnalyticsService } from '@blockframes/analytics/service';

@Component({
  selector: 'movie-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit {
  public movie$ = this.shell.movie$;
  public status: Record<string, Movie['productionStatus'][]> = {
    afterProd: ['post_production', 'finished', 'released'],
  };
  public keys: Record<string, (keyof Movie)[]> = {
    main: ['logline', 'synopsis', 'keywords'],
    general: ['release', 'originCountries', 'originalLanguages', 'genres', 'runningTime'],
    prizes: ['prizes', 'review'],
  };
  private alreadyPlayed = false;

  constructor(
    private shell: TitleMarketplaceShellComponent,
    private dynTitle: DynamicTitleService,
    private analytics: AnalyticsService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Film Page', 'Main Info');
  }

  videoStateChanged(title: Movie, event: string) {
    if (event === 'play' && !this.alreadyPlayed) {
      this.analytics.addTitle('promoElementOpened', title);
      this.alreadyPlayed = true;
    }
  }

  getMainVideo(movie: Movie) {
    const videos = movie.promotional.videos;
    const isPublicVideo = (video: MovieVideo) => {
      return video?.storagePath && video?.privacy === 'public' && video?.jwPlayerId;
    }
    if (isPublicVideo(videos.salesPitch)) return videos.salesPitch;
    if (isPublicVideo(videos.otherVideo)) return videos.otherVideo;
    if (this.shell.currentApp === 'catalog' && isPublicVideo(videos.publicScreener)) return videos.publicScreener;
  }

}
