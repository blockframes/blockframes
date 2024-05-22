import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

// Components
import { OrganizationFormDescriptionComponent } from './organization-form-description.component';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

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
