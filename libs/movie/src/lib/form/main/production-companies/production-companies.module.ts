import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { ProductionCompaniesComponent } from './production-companies.component';
// Material
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field'

@NgModule({
  declarations: [ProductionCompaniesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule
  ],
  exports: [ProductionCompaniesComponent]
})
export class MovieFormProductionCompaniesModule { }