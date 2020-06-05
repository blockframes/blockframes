import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Components
import { OrganizationFormDescriptionComponent } from './organization-form-description.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    // Material
    MatFormFieldModule,
    MatDividerModule,
    MatInputModule,
    MatSelectModule,
  ],
  declarations: [
    OrganizationFormDescriptionComponent,
  ],
  exports: [OrganizationFormDescriptionComponent]
})
export class OrganizationFormDescriptionModule {}
