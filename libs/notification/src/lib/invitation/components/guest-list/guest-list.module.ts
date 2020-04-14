import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuestItemModule } from '../guest-item/guest-item.module';
import { GuestListComponent } from './guest-list.component';

// Material
import { MatListModule } from '@angular/material/list';



@NgModule({
  declarations: [GuestListComponent],
  exports: [GuestListComponent],
  imports: [
    CommonModule,
    GuestItemModule,
    MatListModule,
  ]
})
export class GuestListModule { }
