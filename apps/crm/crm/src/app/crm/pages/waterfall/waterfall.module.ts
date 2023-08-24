import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { WaterfallComponent } from './waterfall.component';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule, ToLabelModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { GraphModule } from '@blockframes/waterfall/components/g6/graph/graph.module';
import { SalesMapModule } from '@blockframes/waterfall/components/sales-map/sales-map.module';
import { TreeModule } from '@blockframes/waterfall/components/g6/tree/tree.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [WaterfallComponent],
  imports: [
    CommonModule,

    MovieHeaderModule,
    TableModule,
    ToGroupLabelPipeModule,
    ToLabelModule,
    ImageModule,
    MaxLengthModule,
    JoinPipeModule,
    PricePerCurrencyModule,
    GraphModule,
    TreeModule,
    SalesMapModule,
    ClipboardModule,

    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatDialogModule,
    MatTabsModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: WaterfallComponent }])
  ]
})
export class WaterfallModule { }
