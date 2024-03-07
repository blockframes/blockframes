// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';

// Pages
import { WaterfallComponent } from './waterfall.component';

// Modules
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { GraphModule } from '@blockframes/waterfall/components/g6/graph/graph.module';
import { TreeModule } from '@blockframes/waterfall/components/g6/tree/tree.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { RightHolderNamePipeModule } from '@blockframes/waterfall/pipes/rightholder-name.pipe';
import { EmptyWaterfallModule } from '@blockframes/waterfall/components/empty/empty.module';
import { ConfirmInputModule } from '@blockframes/ui/confirm-input/confirm-input.module';
import { VersionSelectorModule } from '@blockframes/waterfall/components/version/version-selector/version-selector.module';

// Material
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [WaterfallComponent],
  imports: [
    CommonModule,

    TableModule,
    ImageModule,
    PricePerCurrencyModule,
    GraphModule,
    TreeModule,
    ClipboardModule,
    RightHolderNamePipeModule,
    EmptyWaterfallModule,
    ConfirmInputModule,
    VersionSelectorModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatDialogModule,

    // Routing
    RouterModule.forChild([{ path: '', component: WaterfallComponent }]),
  ],
})
export class WaterfallModule { }
