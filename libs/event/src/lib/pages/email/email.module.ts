import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailComponent } from './email.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

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
    RouterModule.forChild([{ path: '', component: EmailComponent }]),
  ]
})
export class EmailModule { }
