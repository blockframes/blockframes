// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
// Component
import { HideEmailComponent } from './hide-email.component';

// Material
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

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
