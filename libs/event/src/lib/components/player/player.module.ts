import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventPlayerComponent } from './player.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [EventPlayerComponent],
  exports: [EventPlayerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    MatProgressSpinnerModule,
  ]
})
export class EventPlayerModule { }
