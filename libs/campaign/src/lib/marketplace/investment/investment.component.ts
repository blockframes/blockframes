import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CampaignService } from '../../+state';
import { pluck, switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'campaign-marketplace-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceInvestmentComponent {
  campaign$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((id: string) => this.service.valueChanges(id)),
  );

  constructor(
    private service: CampaignService,
    private route: ActivatedRoute,
  ) { }

}
