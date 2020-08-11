import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OrganizationFormAddressModule } from '../organization-form-address/organization-form-address.module';
import { OrganizationFormDescriptionModule } from '../organization-form-description/organization-form-description.module';
import { CropperModule } from '@blockframes/media/components/cropper/cropper.module';
import { FormCountryModule } from '@blockframes/ui/form/country/country.module';
import { ReferencePathModule } from '@blockframes/media/directives/media/reference-path.pipe';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

// Components
import { OrganizationFormComponent } from './organization-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CropperModule,
    OrganizationFormAddressModule,
    OrganizationFormDescriptionModule,
    FormCountryModule,
    ReferencePathModule,
    // Material
    MatFormFieldModule,
    MatDividerModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule
  ],
  declarations: [
    OrganizationFormComponent,
  ],
  exports: [OrganizationFormComponent]
})
export class OrganizationFormModule {}
