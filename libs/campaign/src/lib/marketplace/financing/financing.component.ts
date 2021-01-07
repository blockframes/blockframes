import { ChangeDetectionStrategy, Component, Inject, LOCALE_ID, OnInit, Pipe, PipeTransform } from '@angular/core';
import { formatCurrency, formatPercent } from '@angular/common';
import { Budget, Campaign, CampaignService, Funding } from '../../+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { getTotalFundings } from '@blockframes/campaign/pipes/fundings.pipe';
import { ThemeService } from '@blockframes/ui/theme';

const budgetData: { serie: keyof Budget, label: string }[] = [{
  serie: 'development',
  label: 'Development',
}, {
  serie: 'shooting',
  label: 'Shooting',
}, {
  serie: 'postProduction',
  label: 'Post production',
}, {
  serie: 'administration',
  label: 'Administration',
}, {
  serie: 'contingency',
  label: 'Contingency',
}];

@Component({
  selector: 'campaign-marketplace-financing',
  templateUrl: './financing.component.html',
  styleUrls: ['./financing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceFinancingComponent implements OnInit {
  public totalFundings: number;
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
      tap(campaign => this.totalFundings = getTotalFundings(campaign.fundings))
    );
  }
}

@Pipe({ name: 'apexBudget' })
export class ApexBudgetPipe implements PipeTransform {

  constructor(private themeService: ThemeService) {}

  transform(budget: Budget) {
    const data = budgetData.filter(b => !!budget[b.serie]);
    if (!data.length) return;
    const l = this.themeService.theme === 'dark' ? '45%' : '65%';
    return {
      series: data.map(b => budget[b.serie]),
      labels: data.map(b => b.label),
      colors: data.map((_, i) => `hsl(${200 + ((270 - 200) * (i / data.length))}, 100%, ${l})`),
      data
    };
  }
}

@Pipe({ name: 'apexFunding' })
export class ApexFundingPipe implements PipeTransform {
  constructor(private themeService: ThemeService) {}

  transform(fundings: Funding[]) {
    if (!fundings.length) return;
    const l = this.themeService.theme === 'dark' ? '45%' : '65%';
    return {
      series: fundings.map(f => f.amount),
      labels: fundings.map(f => f.name),
      colors: fundings.map((_, i) => `hsl(${200 + ((270 - 200) * (i / fundings.length))}, 100%, ${l})`),
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
