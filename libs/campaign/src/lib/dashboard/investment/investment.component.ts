import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Campaign, CampaignService } from '../../+state';
import { CampaignForm } from '../../form/form';
import { map, pluck, switchMap, tap } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Movie } from '@blockframes/data-model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'campaign-dashboard-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvestmentComponent {

  public movieId$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId)),
    switchMap(movie => this.service.valueChanges(movie.id).pipe(map(campaign => [movie, campaign]))),
    tap(([movie, campaign]: [Movie, Campaign]) => {
      this.form.setAllValue(campaign);
      const titleName = movie?.title?.international || 'No title';
      this.dynTitle.setPageTitle(`${titleName}`, 'Investment Information');
    }),
    map(([movie]: [Movie, Campaign]) => movie.id)
  );

  form = new CampaignForm();

  constructor(
    private service: CampaignService,
    private movieService: MovieService,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService
  ) { }

}
