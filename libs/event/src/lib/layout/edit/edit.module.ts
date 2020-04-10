import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventEditComponent } from './edit.component';
import { ImageReferenceModule } from '@blockframes/ui/media'
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { StatusModule } from '@blockframes/invitation/pipes/status.pipe';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { TimePickerModule } from '@blockframes/ui/form/time-picker/time-picker.module';



@NgModule({
  declarations: [EventEditComponent],
  exports: [EventEditComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    TimePickerModule,
    RouterModule,
    ImageReferenceModule,
    DisplayNameModule,
    StatusModule,

    // Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
  ]
})
export class EventEditModule { }
