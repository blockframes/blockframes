import { ChangeDetectionStrategy, Component, Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { formatCurrency, formatPercent } from '@angular/common';
import { CampaignService } from '../../+state';
import { Observable } from 'rxjs';
import { pluck, switchMap, tap } from 'rxjs/operators';
import { getTotalFundings } from '@blockframes/campaign/pipes/fundings.pipe';
import { ThemeService } from '@blockframes/ui/theme';
import { ConsentsService } from '@blockframes/consents/+state/consents.service';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { MatDialog } from '@angular/material/dialog';
import { Access, StorageFile, Budget, Campaign, Funding } from '@blockframes/model';
import { ActivatedRoute } from '@angular/router';

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
export class MarketplaceFinancingComponent {
  public totalFundings: number;
  public storagePath: StorageFile;
  campaign$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((id: string) => this.service.valueChanges(id)),
    tap(campaign => this.totalFundings = getTotalFundings(campaign.fundings))
  );
  public access: Access<Date>;
  accessConsent: Observable<Access<Date>>;
  budgetData = budgetData;
  formatter = {
    currency: (campaign: Campaign) => ({
      formatter: (value: number) => typeof value === 'number' ? formatCurrency(value, this.locale, campaign.currency) : '',
    }),
    percent: {
      formatter: (value: number) => typeof value === 'number' ? formatPercent(value / 100, this.locale) : '',
    }
  };

  constructor(
    @Inject(LOCALE_ID) private locale,
    private service: CampaignService,
    private route: ActivatedRoute,
    private consentsService: ConsentsService,
    private dialog: MatDialog
  ) { }

  consentBeforeDownload(campaignId: string, file: string) {
    this.dialog.open(ConfirmInputComponent, {
      data: {
        title: 'Confidentiality Reminder',
        subtitle: `You are about to download a confidential document. Please make sure that you are aware of our Confidentiality Policy before doing so.`,
        text: 'To confirm that you agree with these terms, please write “I AGREE” in the field below.',
        confirmationWord: 'i agree',
        confirmButtonText: 'confirm and download',
        onConfirm: async () => {
          await this.consentsService.createConsent('access', campaignId, file);
          window.open(file, '_blank');
        }
      }
    });
  }
}

@Pipe({ name: 'apexBudget' })
export class ApexBudgetPipe implements PipeTransform {

  constructor(private themeService: ThemeService) { }

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
  constructor(private themeService: ThemeService) { }

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
