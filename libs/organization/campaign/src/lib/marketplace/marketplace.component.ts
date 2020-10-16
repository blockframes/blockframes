import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Campaign, CampaignService } from '../+state';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'campaign-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceComponent implements OnInit {
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
