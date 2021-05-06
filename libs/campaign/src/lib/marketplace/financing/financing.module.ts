import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketplaceFinancingComponent, ApexBudgetPipe, ApexFundingPipe, ApexProfitsPipe } from './financing.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DownloadPipeModule } from '@blockframes/media/file/pipes/download.pipe';
import { BudgetPipeModule, FundingsPipeModule } from '../../pipes';
import { HasKeysModule } from '@blockframes/utils/pipes';
import { CrmFormDialogModule } from '@blockframes/admin/admin-panel/components/crm-form-dialog/crm-form-dialog.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [MarketplaceFinancingComponent, ApexBudgetPipe, ApexFundingPipe, ApexProfitsPipe],
  imports: [
    CommonModule,
    FlexLayoutModule,
    BudgetPipeModule,
    FundingsPipeModule,
    DownloadPipeModule,
    HasKeysModule,
    NgApexchartsModule,
    CrmFormDialogModule,
    // Materials
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: MarketplaceFinancingComponent }])
  ]
})
export class MarketplaceFinancingModule { }
