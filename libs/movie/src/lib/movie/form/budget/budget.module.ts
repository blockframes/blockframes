import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { BoxOfficeComponent } from './box-office/box-office.component';
import { RangeComponent } from './range/range.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [RangeComponent, BoxOfficeComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  exports: [RangeComponent, BoxOfficeComponent]
})
export class MovieFormBudgetModule { }
