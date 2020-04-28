import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventPlayerComponent } from './player.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [EventPlayerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule.forChild([{ path: '', component: EventPlayerComponent }])
  ]
})
export class EventPlayerModule { }
