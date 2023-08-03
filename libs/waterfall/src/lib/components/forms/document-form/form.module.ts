
// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

// Blockframes
import { TimePickerModule } from '@blockframes/ui/form/time-picker/time-picker.module';
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { AutocompleteModule } from '@blockframes/ui/autocomplete/autocomplete.module';

// Pages
import { FormComponent } from './form.component';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
  declarations: [FormComponent],
  exports: [FormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImageUploaderModule,
    AutocompleteModule,
    StaticSelectModule,
    FileUploaderModule,
    TimePickerModule,

    // Material
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
  ],
})
export class FormModule { }
