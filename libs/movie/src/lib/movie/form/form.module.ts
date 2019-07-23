import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatButtonModule,
  MatSelectModule,
  MatChipsModule,
  MatCardModule
} from '@angular/material';
import { UploadModule, UiFormModule } from '@blockframes/ui';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CommonModule } from '@angular/common';

// components
import { MovieFormMainComponent } from './main/main.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Material
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    NgxMatSelectSearchModule,

    // Librairies
    UiFormModule,
    UploadModule,
  ],
  declarations: [
    MovieFormMainComponent
  ],
  exports: [MovieFormMainComponent]
})
export class MovieFormModule {}
