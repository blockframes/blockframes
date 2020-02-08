import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Components
import { OrganizationFormComponent } from './organization-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CropperModule,

    // Material
    MatFormFieldModule,
    MatDividerModule,
    MatInputModule,
  ],
  declarations: [
    OrganizationFormComponent,
  ],
  exports: [OrganizationFormComponent]
})
export class OrganizationFormModule {}
