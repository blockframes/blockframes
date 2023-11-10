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

// Pages
import { StatementsComponent } from './statements.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

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

    // Material
    MatFormFieldModule,
    MatChipsModule,
    MatDividerModule,

    // Routing
    RouterModule.forChild([{ path: '', component: StatementsComponent }]),
  ],
})
export class StatementsModule { }
