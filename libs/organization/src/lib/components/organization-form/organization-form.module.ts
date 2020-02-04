import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { PasswordConfirmModule } from '@blockframes/ui/form';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Components
import { OrganizationFormComponent } from './organization-form.component';
import { OrganizationFormAddressComponent } from './organization-form-address/organization-form-address.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    PasswordConfirmModule,
    CropperModule,

    // Material
    MatFormFieldModule,
    MatDividerModule,
    MatInputModule,
  ],
  declarations: [
    OrganizationFormComponent,
    OrganizationFormAddressComponent,
  ],
  exports: [OrganizationFormComponent, OrganizationFormAddressComponent]
})
export class OrganizationFormModule {}
