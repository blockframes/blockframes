import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { GuestItemModule } from '../guest-item/guest-item.module';
import { GuestListComponent } from './guest-list.component';
import { StatusModule } from '../../pipes/status.pipe';

// Material
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
