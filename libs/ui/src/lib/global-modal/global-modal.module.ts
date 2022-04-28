import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';

import { GlobalModalComponent } from './global-modal.component';

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
