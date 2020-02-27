import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
