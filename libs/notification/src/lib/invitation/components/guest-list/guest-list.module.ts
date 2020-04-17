import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { GuestItemModule } from '../guest-item/guest-item.module';
import { GuestListComponent } from './guest-list.component';

// Material
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [GuestListComponent],
  exports: [GuestListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GuestItemModule,
    // Material
    ScrollingModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ]
})
export class GuestListModule { }
