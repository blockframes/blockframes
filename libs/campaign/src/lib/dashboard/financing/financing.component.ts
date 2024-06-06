import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CampaignService } from '../../service';
import { CampaignForm } from '../../form/form';
import { Movie, Campaign } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { map, pluck, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'campaign-financing',
  templateUrl: './financing.component.html',
  styleUrls: ['./financing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancingComponent {
  public movieId$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId)),
    switchMap((movie) =>
      this.service.valueChanges(movie.id).pipe(map((campaign) => [movie, campaign]))
    ),
    tap(([movie, campaign]: [Movie, Campaign]) => {
      this.form.setAllValue(campaign);
      const titleName = movie?.title?.international || 'No title';
      this.dynTitle.setPageTitle(`${titleName}`, 'Financing Information');
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
