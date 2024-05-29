import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmComponent } from './confirm.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { GlobalModalModule } from '../global-modal/global-modal.module';

@NgModule({
  declarations: [ConfirmComponent],
  imports: [CommonModule, MatIconModule, MatButtonModule, FlexLayoutModule, GlobalModalModule],
  exports: [ConfirmComponent]
})
export class ConfirmModule { }
