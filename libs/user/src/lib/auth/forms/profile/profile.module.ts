import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';
import { ProfileFormComponent } from './profile.component';
import { HideEmailModule } from '@blockframes/auth/components/hide-email/hide-email.module';

// Material
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

@NgModule({
  declarations: [ProfileFormComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageUploaderModule,
    ReactiveFormsModule,
    HideEmailModule,

    // Material
    MatCardModule,
    MatFormFieldModule,
    MatDividerModule,
    MatInputModule
  ],
  exports: [ProfileFormComponent]
})
export class ProfileFormModule { }
