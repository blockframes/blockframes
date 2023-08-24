import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { WaterfallDocumentComponent } from './waterfall-document.component';

// Blockframes
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { TermPipeModule } from '@blockframes/contract/term/pipes';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { DetailedGroupModule } from '@blockframes/ui/detail-modal/detailed.module';
import { ToGroupLabelPipeModule, JoinPipeModule } from '@blockframes/utils/pipes';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [WaterfallDocumentComponent],
  imports: [
    CommonModule,

    MovieHeaderModule,
    TermPipeModule,
    TableModule,
    DetailedGroupModule,
    ToGroupLabelPipeModule,
    JoinPipeModule,

    MatIconModule,
    MatButtonModule,

    RouterModule.forChild([{ path: '', component: WaterfallDocumentComponent }])
  ]
})
export class WaterfallDocumentModule { }
