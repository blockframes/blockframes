import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailComponent } from './email.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Blockframes
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
    AppLogoModule,
    ReactiveFormsModule,
    MatCheckboxModule,

    RouterModule.forChild([{ path: '', component: EmailComponent }]),
  ]
})
export class EmailModule { }
