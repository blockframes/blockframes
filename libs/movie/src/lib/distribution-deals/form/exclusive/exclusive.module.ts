import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistributionDealExclusiveComponent } from './exclusive.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FlexLayoutModule, MatSlideToggleModule],
  declarations: [DistributionDealExclusiveComponent],
  exports: [DistributionDealExclusiveComponent]
})
export class DistributionDealExclusiveModule {}
