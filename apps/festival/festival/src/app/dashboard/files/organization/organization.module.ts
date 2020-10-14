import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { OrganizationResourcesComponent } from './organization.component';

// Blockframes
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [OrganizationResourcesComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    TableFilterModule,
    FileNameModule,
    ImageReferenceModule,

    // Material
    MatButtonModule,
    MatIconModule,

    // Routing
    RouterModule.forChild([{ path: '', component: OrganizationResourcesComponent }])
  ],
})
export class OrganizationResourcesModule { }
