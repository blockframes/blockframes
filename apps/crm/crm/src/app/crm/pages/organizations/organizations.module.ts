import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OrganizationsComponent } from './organizations.component';

import { BreadCrumbModule } from '../../components/bread-crumb/bread-crumb.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { AppPipeModule, ToLabelModule } from '@blockframes/utils/pipes';
import { GoToAppModule } from '@blockframes/admin/crm/pipes/go-to.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TagModule } from '@blockframes/ui/tag/tag.module';


@NgModule({
  declarations: [OrganizationsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    BreadCrumbModule,
    TableModule,
    ImageModule,
    AppPipeModule,
    ToLabelModule,
    GoToAppModule,
    TagModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: OrganizationsComponent }])
  ]
})
export class OrganizationListModule {}