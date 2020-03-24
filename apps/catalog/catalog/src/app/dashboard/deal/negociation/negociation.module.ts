import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NegociationComponent } from './negociation.component';

import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { DisplayNameModule, TranslateSlugModule } from '@blockframes/utils/pipes';
import { RightListModule } from '@blockframes/distribution-deals/components/right-list/right-list.module';
import { VersionTableModule } from '@blockframes/contract/version/components';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [NegociationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TableFilterModule,
    ImageReferenceModule,
    TranslateSlugModule,
    RightListModule,
    VersionTableModule,
    DisplayNameModule,
    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatExpansionModule,
    // Router
    RouterModule.forChild([{ path: '', component: NegociationComponent }])
  ],
  exports: [NegociationComponent]
})
export class NegociationModule { }
