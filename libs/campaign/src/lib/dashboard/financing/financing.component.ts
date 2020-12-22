import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CampaignService } from '@blockframes/campaign/+state';
import { CampaignForm } from '@blockframes/campaign/form/form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'campaign-financing',
  templateUrl: './financing.component.html',
  styleUrls: ['./financing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  movieId$ = this.route.selectParams('movieId');
  form = new CampaignForm();

  constructor(
    private service: CampaignService,
    private route: RouterQuery,
    private dynTitle: DynamicTitleService
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Title page', 'Financing Information');
    this.sub = this.movieId$.pipe(
      switchMap((id: string) => this.service.valueChanges(id))
    ).subscribe(campaign => this.form.setAllValue(campaign));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
