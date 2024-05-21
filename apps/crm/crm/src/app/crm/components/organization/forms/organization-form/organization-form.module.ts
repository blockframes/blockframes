import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { CrmOrganizationFormComponent } from './organization-form.component';

// Material
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

// Modules
import { OrganizationFormAddressModule } from '@blockframes/organization/forms/organization-form-address/organization-form-address.module';
import { OrganizationFormDescriptionModule } from '@blockframes/organization/forms/organization-form-description/organization-form-description.module';
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FlexLayoutModule,

    // Material
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatInputModule,

    // Blockframes
    OrganizationFormAddressModule,
    OrganizationFormDescriptionModule,
    ImageUploaderModule
  ],
  declarations: [CrmOrganizationFormComponent],
  exports: [CrmOrganizationFormComponent]
})
export class AdminOrganizationFormModule { }
