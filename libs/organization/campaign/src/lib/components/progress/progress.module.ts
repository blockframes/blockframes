import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ProgressComponent } from './progress.component';
import { NumberPipeModule } from '@blockframes/utils/pipes';


import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [ProgressComponent],
  exports: [ProgressComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    NumberPipeModule,
    MatProgressBarModule
  ]
})
export class CampaignProgressModule { }
