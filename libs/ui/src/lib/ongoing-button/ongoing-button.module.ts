import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { OngoingButtonComponent } from './ongoing-button.component';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FlexLayoutModule,

    // Material
    MatButtonModule,
  ],
  declarations: [OngoingButtonComponent],
  exports: [OngoingButtonComponent]
})
export class OngoingButtonModule { }
