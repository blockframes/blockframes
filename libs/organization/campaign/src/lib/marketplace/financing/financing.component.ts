import { ChangeDetectionStrategy, Component, Inject, LOCALE_ID, OnInit, Pipe, PipeTransform } from '@angular/core';
import { formatCurrency, formatPercent } from '@angular/common';
import { Budget, Campaign, CampaignService, Funding } from '../../+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const budgetData: { serie: keyof Budget, label: string }[] = [{
  serie: 'producerFees',
  label: 'Producers Fees',
}, {
  serie: 'castCost',
  label: 'Casting Cost',
}, {
  serie: 'shootCost',
  label: 'Shooting Cost',
}, {
  serie: 'postProdCost',
  label: 'Post-Production Cost',
}, {
  serie: 'others',
  label: 'Other Costs',
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
    currency: (campaign: Campaign) => ({
      formatter: (value: number) => typeof value === 'number' ? formatCurrency(value, this.locale, campaign.currency) : ''
    }),
    percent: {
      formatter: (value: number) => typeof value === 'number' ? formatPercent(value / 100, this.locale) : ''
    }
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
    const data = budgetData.filter(b => !!budget[b.serie]);
    if (!data.length) return;
    return {
      series: data.map(b => budget[b.serie]),
      labels: data.map(b => b.label),
      colors: data.map((_, i) =>`hsl(235, ${100 * ((i + 1) / data.length)}%, 50%)`),
      data
    };
  }
}

@Pipe({ name: 'apexFunding' })
export class ApexFundingPipe implements PipeTransform {
  transform(fundings: Funding[]) {
    if (!fundings.length) return;
    return {
      series: fundings.map(f => f.amount),
      labels: fundings.map(f => f.name),
      colors: fundings.map((_, i) =>`hsl(235, ${100 * ((i + 1) / fundings.length)}%, 50%)`),
    };
  }
}

@Pipe({ name: 'apexProfits' })
export class ApexProfitsPipe implements PipeTransform {
  transform(profits: Campaign['profits']) {
    if (!profits.low && !profits.medium && !profits.high) return;
    return {
      xAxis: { categories: ['Low', 'Medium', 'High'] },
      yAxis: { title: '%' },
      series: [{
        name: "Return on Investment",
        data: [profits.low, profits.medium, profits.high]
      }],
    };
  }
}
