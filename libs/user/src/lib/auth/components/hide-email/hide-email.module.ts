// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
// Component
import { HideEmailComponent } from './hide-email.component';

// Material
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';

@NgModule({
  declarations: [HideEmailComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSlideToggleModule
  ],
  exports: [HideEmailComponent]
})
export class HideEmailModule { }
