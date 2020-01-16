import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MovieFormFestivalPrizesComponent } from './festival-prizes.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  declarations: [MovieFormFestivalPrizesComponent],
  exports: [MovieFormFestivalPrizesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Material
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class MovieFormFestivalPrizesModule { }
