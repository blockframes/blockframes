import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { EditDetailsComponent } from './edit-details.component';

// Forms
import { TimeDateModule } from '../time-date.directive';
import { TimePickerModule } from '@blockframes/ui/form/time-picker/time-picker.module';

// Material
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    // Form
    TimeDateModule,
    TimePickerModule,
    // Material
    MatRadioModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatInputModule,
    MatIconModule
  ],
  declarations: [EditDetailsComponent],
  exports: [EditDetailsComponent]
})
export class EditDetailsModule { }
