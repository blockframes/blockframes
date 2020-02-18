import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NegociationComponent } from './negociation.component';

import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { RightListModule } from '@blockframes/movie/distribution-deals/components/right-list/right-list.module';

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
    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatExpansionModule,
    // Router
    RouterModule.forChild([{ path: '', component: NegociationComponent }])
  ]
})
export class NegociationModule { }
