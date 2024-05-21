// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LetModule } from '@rx-angular/template/let';

// Blockframes
import { InternalSaleListComponent } from './internal-sales.component';
import { MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';
import { NegotiationPipeModule } from '@blockframes/contract/negotiation/pipe';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [InternalSaleListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaxLengthModule,
    ToLabelModule,
    TagModule,
    TableModule,
    FilterByModule,
    NegotiationPipeModule,
    LetModule,

    // Material
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,

    // Router
    RouterModule.forChild([]),
  ],
  exports: [InternalSaleListComponent],
})
export class InternalSalesListModule {}
