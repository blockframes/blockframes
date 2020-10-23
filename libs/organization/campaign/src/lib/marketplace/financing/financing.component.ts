import { ChangeDetectionStrategy, Component, Inject, LOCALE_ID, OnInit, Pipe, PipeTransform, ViewEncapsulation } from '@angular/core';
import { Budget, Campaign, CampaignService, Funding } from '@blockframes/campaign/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { toBigCurrency } from '@blockframes/utils/pipes';
import { formatPercent } from '@angular/common';

const budgetData: { serie: keyof Budget, label: string, color: string }[] = [{
  serie: 'producerFees',
  label: 'Producers Fees',
  color: 'rgb(230, 220, 245)'
}, {
  serie: 'castCost',
  label: 'Casting Cost',
  color: 'rgb(201, 212, 255)'
}, {
  serie: 'shootCost',
  label: 'Shooting Cost',
  color: 'rgb(130, 155, 245)'
}, {
  serie: 'postProdCost',
  label: 'Post-Production Cost',
  color: 'rgb(30, 65, 205)'
}, {
  serie: 'others',
  label: 'Other Costs',
  color: 'rgb(50, 55, 80)'
}];

@Component({
  selector: 'campaign-marketplace-financing',
  templateUrl: './financing.component.html',
  styleUrls: ['./financing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceFinancingComponent implements OnInit {
  campaign$: Observable<Campaign>;
  budgetData = budgetData;
  formatter = {
    bigCurrency: { formatter: (value: number) => toBigCurrency(value, this.locale) },
    percent: { formatter: (value: number) => formatPercent(value / 100, this.locale) }
  }

  constructor(
    @Inject(LOCALE_ID) private locale,
    private service: CampaignService,
    private route: RouterQuery,
  ) { }

  ngOnInit(): void {
    this.campaign$ = this.route.selectParams<string>('movieId').pipe(
      switchMap(id => this.service.valueChanges(id)),
    );
  }

}

@Pipe({ name: 'apexBudget' })
export class ApexBudgetPipe implements PipeTransform {
  transform(budget: Budget) {
    return {
      series: budgetData.map(b => budget[b.serie]),
      labels: budgetData.map(b => b.label),
      colors: budgetData.map(b => b.color),
    };
  }
}

@Pipe({ name: 'apexFunding' })
export class ApexFundingPipe implements PipeTransform {
  transform(fundings: Funding[]) {
    return {
      series: fundings.map(f => f.amount),
      labels: fundings.map(f => f.name),
      colors: fundings.map((_, i) =>`hsl(100, ${100 * ((i + 1) / fundings.length)}%, 50%)`),
    };
  }
}

@Pipe({ name: 'apexProfits' })
export class ApexProfitsPipe implements PipeTransform {
  transform(profits: Campaign['profits']) {
    return {
      xAxis: { categories: ["Low", "Medium", "High"] },
      yAxis: { title: '%' },
      series: [{
        name: "Return on Investment",
        data: [profits.low, profits.medium, profits.high]
      }],
    };
  }
}
