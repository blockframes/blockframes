import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CongratulationComponent } from './congratulation.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [CongratulationComponent],
  imports: [CommonModule, MatButtonModule, FlexLayoutModule, RouterModule],
  exports: [CongratulationComponent],
})
export class CongratulationModule { }
