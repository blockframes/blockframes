import { ChangeDetectionStrategy, Component, Inject, LOCALE_ID, OnInit, Pipe, PipeTransform } from '@angular/core';
import { formatCurrency, formatPercent } from '@angular/common';
import { Budget, Campaign, CampaignService, Funding } from '../../+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { getTotalFundings } from '@blockframes/campaign/pipes/fundings.pipe';
import { ThemeService } from '@blockframes/ui/theme';

import { ConsentsService } from '@blockframes/consents/+state/consents.service';
import { CrmFormDialogComponent } from '@blockframes/admin/admin-panel/components/crm-form-dialog/crm-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { fileURLToPath } from 'url';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
import { GetUrlPipe } from '@blockframes/media/file/pipes/download.pipe';
import { MediaService } from '@blockframes/media/+state/media.service';

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
  public acceptConsent = false;
  // file = GetUrlPipe;
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
    private mediaService: MediaService,

    private queryOrg: OrganizationQuery,
    private consentsService: ConsentsService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.campaign$ = this.route.selectParams<string>('movieId').pipe(
      switchMap(id => this.service.valueChanges(id)),
      tap(campaign => this.totalFundings = getTotalFundings(campaign.fundings))
    );
  }

  consentBeforeDownload(file: string){
    // let file: Partial<Campaign> ;
    // let test: GetUrlPipe;
    const orgId = this.queryOrg.getActiveId();
    const a = document.createElement('a');
    // console.log(file);
    // console.log(orgId);
    const content = a.innerHTML;
    // a.innerHTML = ;
    const linkText = document.createTextNode("Confidentiality Policy");
    // a.appendChild(linkText);
    // a.title = "Confidentiality Policy";
    // a.href = "https://www.mediafinanciers.com/c/o/marketplace/privacy";

    // document.body.appendChild(a);
    a.innerHTML += `<a href="https://www.mediafinanciers.com/c/o/marketplace/privacy"> Confidentiality Policy </a>`;


    // let urlPipe: GetUrlPipe;
    // urlPipe.transform(file);

    console.log(file);
    // if(!!File){
      this.dialog.open(CrmFormDialogComponent, {
        data: {
          title: 'Confidentiality Reminder',
          subTitle: 'You are about to download a confidential document. Please make sure that you are aware of our '+a+' before doing so.',
          text: 'By submitting your project, you assume the responsibility of disclosing all of the information previously filled out to potential future investors. Before submitting your project, please confirm by writing “I AGREE” in the field below.',
          confirmationWord: 'i agree',
          confirmButtonText: 'Confirm and download',
          onConfirm: async () => {
            // console.log(file);
            // file.files.budget.toString();
              // if(file.files.budget){
                await this.consentsService.createConsent('access', orgId, file);
                // window.location.href = file;
                window.open(file, '_blank');
              // }
              // if(file.files.financingPlan){
              //   await this.consentsService.createConsent('access', orgId, file.files.financingPlan);
              // }
              // if(file.files.waterfall){
              //   await this.consentsService.createConsent('access', orgId, file.files.waterfall);
              // }
              // window.location.href = file;
              // console.log(file.files.budget);


          }
        }
      })
    // }
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
