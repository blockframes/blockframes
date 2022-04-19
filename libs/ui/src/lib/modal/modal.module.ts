import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalModalComponent } from './modal.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    GlobalModalComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FlexLayoutModule
  ],
  exports: [
    GlobalModalComponent
  ]
})

export class GlobalModalModule { }
