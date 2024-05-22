import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OrganizationFormAddressModule } from '../organization-form-address/organization-form-address.module';
import { OrganizationFormDescriptionModule } from '../organization-form-description/organization-form-description.module';
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

// Components
import { OrganizationFormComponent } from './organization-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    ImageUploaderModule,
    OrganizationFormAddressModule,
    OrganizationFormDescriptionModule,

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
