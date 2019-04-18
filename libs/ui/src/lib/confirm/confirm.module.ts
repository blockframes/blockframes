import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmComponent } from './confirm.component';
import { MatButtonModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [ConfirmComponent],
  imports: [CommonModule, MatButtonModule, FlexLayoutModule,],
  exports: [ConfirmComponent],
  entryComponents: [ConfirmComponent,]
})
export class ConfirmModule { }
