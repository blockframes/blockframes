import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule,
  MatCardModule,
  MatIconModule,
  MatProgressSpinnerModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrganizationDisplayComponent } from './organization-display.component';

// Modules
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

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
    ImageReferenceModule,
  ],
  declarations: [
    OrganizationDisplayComponent,
  ],
  exports: [
    OrganizationDisplayComponent
  ]
})
export class OrganizationDisplayModule { }
