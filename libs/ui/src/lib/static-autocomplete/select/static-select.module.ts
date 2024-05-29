import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticSelectComponent } from './static-select.component';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSelectModule,
    ToLabelModule,
    MatFormFieldModule
  ],
  declarations: [StaticSelectComponent],
  exports: [StaticSelectComponent]
})
export class StaticSelectModule { }
