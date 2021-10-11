import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { TitleMarketplaceShellComponent } from '../shell/shell.component';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
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

  constructor(
    private shell: TitleMarketplaceShellComponent,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Film Page', 'Main Info');
  }

  showSalesPitch(movie: Movie) {
    if (!movie.promotional?.videos?.salesPitch) return false;
    const { privacy, jwPlayerId, description } = movie.promotional.videos.salesPitch;
    return privacy === 'public' && (jwPlayerId || description);
  }

}
