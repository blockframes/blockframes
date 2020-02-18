import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OrganizationFormAddressModule } from '@blockframes/organization/forms/organization-form-address/organization-form-address.module';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';
import { FormCountryModule } from '@blockframes/ui/form/country/country.module';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

// Components
import { OrganizationFormComponent } from './organization-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CropperModule,
    OrganizationFormAddressModule,
    FormCountryModule,
    // Material
    MatFormFieldModule,
    MatDividerModule,
    MatInputModule,
    MatCardModule,
  ],
  declarations: [
    OrganizationFormComponent,
  ],
  exports: [OrganizationFormComponent]
})
export class OrganizationFormModule {}
