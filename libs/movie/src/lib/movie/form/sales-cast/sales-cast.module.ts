import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormDisplayNameModule } from '@blockframes/ui/form/display-name/display-name.module';
import { MovieFormSalesCastComponent } from './sales-cast.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [MovieFormSalesCastComponent],
  imports: [
      CommonModule,
      FormDisplayNameModule,
      ReactiveFormsModule,
      FlexLayoutModule,
      MatFormFieldModule,
      MatInputModule,
      MatIconModule,
      MatButtonModule,
      MatSelectModule
    ],
  exports: [MovieFormSalesCastComponent],
})
export class MovieFormSalesCastModule { }