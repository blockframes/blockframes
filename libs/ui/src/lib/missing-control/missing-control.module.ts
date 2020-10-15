import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MissingControlComponent } from './missing-control.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ToLabelModule } from '@blockframes/utils/pipes';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule,
    ToLabelModule,
  ],
  declarations: [MissingControlComponent],
  exports: [MissingControlComponent]
})
export class MissingControlModule {}
