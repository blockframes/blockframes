import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountdownComponent } from './countdown.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CounterDisplayComponent } from './counter-display/counter-display.component';

@NgModule({
  declarations: [CountdownComponent, CounterDisplayComponent],
  exports: [CountdownComponent],
  imports: [
    CommonModule,
    FlexLayoutModule
  ]
})
export class CountdownModule { }
