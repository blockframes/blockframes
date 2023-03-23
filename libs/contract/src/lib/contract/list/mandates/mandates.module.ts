// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { LetModule } from '@rx-angular/template/let';

import { MandateListComponent } from './mandates.component';

// Blockframes
import { MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';
import { NegotiationPipeModule } from '@blockframes/contract/negotiation/pipe';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [MandateListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  exports: [MandateListComponent],
})
export class MandatesListModule {}
