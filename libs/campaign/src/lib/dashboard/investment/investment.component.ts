import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CampaignService } from '../../+state';
import { CampaignForm } from '../../form/form';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'campaign-dashboard-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvestmentComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  movieId$ = this.route.selectParams('movieId');
  form = new CampaignForm();

  constructor(
    private service: CampaignService,
    private route: RouterQuery,
    private dynTitle: DynamicTitleService
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Title page', 'Investment Information');
    this.sub = this.movieId$.pipe(
      switchMap((id: string) => this.service.valueChanges(id))
    ).subscribe(campaign => this.form.setAllValue(campaign));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
