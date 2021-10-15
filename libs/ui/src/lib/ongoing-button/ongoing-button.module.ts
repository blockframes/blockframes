import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OngoingButtonComponent } from './ongoing-button.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
  ],
  declarations: [OngoingButtonComponent],
  exports: [OngoingButtonComponent]
})
export class OngoingButtonModule { }
