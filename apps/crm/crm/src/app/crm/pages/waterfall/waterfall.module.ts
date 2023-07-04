import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { WaterfallComponent } from './waterfall.component';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule } from '@blockframes/utils/pipes';
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [WaterfallComponent],
  imports: [
    CommonModule,
    MovieHeaderModule,
    TableModule,
    ToGroupLabelPipeModule,
    MaxLengthModule,
    JoinPipeModule,
    GetOrgPipeModule,
    PricePerCurrencyModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatDialogModule,
    MatTabsModule,
    RouterModule.forChild([{ path: '', component: WaterfallComponent }])
  ]
})
export class WaterfallModule { }
