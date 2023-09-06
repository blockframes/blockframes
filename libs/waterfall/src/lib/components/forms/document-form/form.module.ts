
// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

// Blockframes
import { AutocompleteModule } from '@blockframes/ui/autocomplete/autocomplete.module';
import { TimePickerModule } from '@blockframes/ui/form/time-picker/time-picker.module';
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';

// Pages
import { DocumentFormComponent } from './form.component';


@NgModule({
  declarations: [DocumentFormComponent],
  exports: [DocumentFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutocompleteModule,
    StaticSelectModule,
    FileUploaderModule,
    TimePickerModule,

    // Material
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
  ],
})
export class DocumentFormModule { }
