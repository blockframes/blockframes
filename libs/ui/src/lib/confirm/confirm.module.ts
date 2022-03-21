import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmComponent } from './confirm.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [ConfirmComponent],
  imports: [CommonModule, MatIconModule, MatButtonModule, FlexLayoutModule],
  exports: [ConfirmComponent]
})
export class ConfirmModule { }
