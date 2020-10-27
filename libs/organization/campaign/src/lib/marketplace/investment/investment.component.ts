import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Campaign, CampaignService } from '../../+state';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'campaign-marketplace-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceInvestmentComponent implements OnInit {
  campaign$: Observable<Campaign>;

  constructor(
    private service: CampaignService,
    private route: RouterQuery,
  ) { }

  ngOnInit(): void {
    this.campaign$ = this.route.selectParams('movieId').pipe(
      switchMap((id: string) => this.service.valueChanges(id))
    )
  }

}
