import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountdownComponent } from './countdown.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [CountdownComponent],
  exports: [CountdownComponent],
  imports: [
    CommonModule,
    FlexLayoutModule
  ]
})
export class CountdownModule { }
