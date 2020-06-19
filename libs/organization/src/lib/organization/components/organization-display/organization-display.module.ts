import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Components
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrganizationDisplayComponent } from './organization-display.component';

// Modules
import { ImgModule } from '@blockframes/ui/media/img/img.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    FlexLayoutModule,
    ImgModule,
  ],
  declarations: [
    OrganizationDisplayComponent,
  ],
  exports: [
    OrganizationDisplayComponent
  ]
})
export class OrganizationDisplayModule { }
