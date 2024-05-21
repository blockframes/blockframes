import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailComponent } from './email.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [EmailComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ImageModule,
    AppLogoModule,
    ReactiveFormsModule,
    MatCheckboxModule,

    RouterModule.forChild([{ path: '', component: EmailComponent }]),
  ]
})
export class EmailModule { }
