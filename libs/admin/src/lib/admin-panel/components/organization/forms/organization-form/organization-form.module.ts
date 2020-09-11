import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components 
import { AdminOrganizationFormComponent } from './organization-form.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';

// Modules
import { OrganizationFormAddressModule } from '@blockframes/organization/forms/organization-form-address/organization-form-address.module';
import { OrganizationFormDescriptionModule } from '@blockframes/organization/forms/organization-form-description/organization-form-description.module';
import { CropperModule } from '@blockframes/media/components/cropper/cropper.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
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
    CropperModule
  ],
  declarations: [AdminOrganizationFormComponent],
  exports: [AdminOrganizationFormComponent]
})
export class AdminOrganizationFormModule { }
