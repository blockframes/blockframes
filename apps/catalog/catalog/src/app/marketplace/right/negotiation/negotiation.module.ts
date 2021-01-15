import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NegotiationComponent } from './negotiation.component';

import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { RightListModule } from '@blockframes/distribution-rights/components/right-list/right-list.module';
import { VersionTableModule } from '@blockframes/contract/version/components';
import { ToLabelModule } from '@blockframes/utils/pipes';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [NegotiationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TableFilterModule,
    ImageModule,
    ToLabelModule,
    RightListModule,
    VersionTableModule,
    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatExpansionModule,
    // Router
    RouterModule.forChild([{ path: '', component: NegotiationComponent }])
  ]
})
export class NegotiationModule { }
