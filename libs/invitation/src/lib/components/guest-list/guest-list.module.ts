import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { GuestItemModule } from '../guest-item/guest-item.module';
import { GuestListComponent } from './guest-list.component';
import { StatusModule } from '../../pipes/status.pipe';

// Material
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [GuestListComponent],
  exports: [GuestListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GuestItemModule,
    StatusModule,
    // Material
    ScrollingModule,
    ClipboardModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class GuestListModule { }
