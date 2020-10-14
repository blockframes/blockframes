import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ProgressComponent } from './progress.component';


import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [ProgressComponent],
  exports: [ProgressComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatProgressBarModule
  ]
})
export class CampaignProgressModule { }
