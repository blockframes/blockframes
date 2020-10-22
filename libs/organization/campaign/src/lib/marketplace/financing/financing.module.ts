import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketplaceFinancingComponent, ApexBudgetPipe, ApexFundingPipe, ApexProfitsPipe } from './financing.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgApexchartsModule } from 'ng-apexcharts';
import { BudgetPipeModule, FundingsPipeModule } from '../../pipes';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NumberPipeModule } from '@blockframes/utils/pipes';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [MarketplaceFinancingComponent, ApexBudgetPipe, ApexFundingPipe, ApexProfitsPipe],
  imports: [
    CommonModule,
    FlexLayoutModule,
    NumberPipeModule,
    BudgetPipeModule,
    FundingsPipeModule,
    NgApexchartsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: MarketplaceFinancingComponent }])
  ]
})
export class MarketplaceFinancingModule { }
