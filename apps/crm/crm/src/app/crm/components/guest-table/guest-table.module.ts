import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Materials
import { MatIconModule } from '@angular/material/icon';

// Modules
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Components
import { GuestTableComponent } from './guest-table.component';

@NgModule({
  declarations: [GuestTableComponent],
  exports: [GuestTableComponent],
  imports: [
    CommonModule,
    TableFilterModule,
    FlexLayoutModule,
    OrgNameModule,
    MatIconModule,
    RouterModule,
    ImageModule,
  ]
})
export class GuestTableModule { }
