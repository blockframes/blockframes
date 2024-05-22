// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
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
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Material
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

@NgModule({
  declarations: [WaterfallComponent],
  imports: [
    BfCommonModule,

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
