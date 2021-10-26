import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Materials
import { MatIconModule } from '@angular/material/icon';

// Modules
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
// Components
import { GuestTableComponent } from './guest-table.component';
import { TableModule } from '@blockframes/ui/list/table/table.module';

@NgModule({
  declarations: [GuestTableComponent],
  exports: [GuestTableComponent],
  imports: [
    CommonModule,
    TableModule,
    FlexLayoutModule,
    OrgNameModule,
    MatIconModule,
    RouterModule,
    ImageModule,
    ToLabelModule
  ]
})
export class GuestTableModule { }
