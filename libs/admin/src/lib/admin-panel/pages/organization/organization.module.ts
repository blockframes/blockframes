import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule,
  MatCardModule,
  MatIconModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Components
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrganizationComponent } from './organization.component';

// Modules
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { OrganizationDisplayModule } from '@blockframes/organization/components/organization-display/organization-display.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    FlexLayoutModule,
    OrganizationDisplayModule,
    TableFilterModule,
    ImageReferenceModule,
  ],
  declarations: [
    OrganizationComponent,
  ],
  exports: [
    OrganizationComponent
  ]
})
export class OrganizationAdminModule { }
