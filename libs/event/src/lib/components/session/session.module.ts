import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventSessionComponent } from './session.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [EventSessionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule.forChild([{ path: '', component: EventSessionComponent }])
  ]
})
export class EventSessionModule { }
