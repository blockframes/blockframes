import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { ProductionYearComponent } from './production-year/production-year.component';
import { ProductionCompaniesComponent } from './production-companies/production-companies.component';
// Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field'

@NgModule({
  declarations: [ProductionYearComponent, ProductionCompaniesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  exports: [ProductionYearComponent, ProductionCompaniesComponent]
})
export class MovieFormMainModule { }