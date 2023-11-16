// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Blockframes
import { RightholderSelectModule } from '@blockframes/waterfall/components/rightholder-select/rightholder-select.module';
import { EmptyWaterfallModule } from '@blockframes/waterfall/components/empty/empty.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { EmptyStatementCardModule } from '@blockframes/waterfall/components/empty-statement-card/empty-statement-card.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { RightHolderNamePipeModule } from '@blockframes/waterfall/pipes/rightholder-name.pipe';

// Pages
import { StatementsComponent } from './statements.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [StatementsComponent],
  imports: [
    CommonModule,

    RightholderSelectModule,
    EmptyWaterfallModule,
    TableModule,
    ToLabelModule,
    EmptyStatementCardModule,
    TagModule,
    PricePerCurrencyModule,
    RightHolderNamePipeModule,

    // Material
    MatFormFieldModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatMenuModule,

    // Routing
    RouterModule.forChild([{ path: '', component: StatementsComponent }]),
  ],
})
export class StatementsModule { }
