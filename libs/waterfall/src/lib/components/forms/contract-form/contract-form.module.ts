
// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { AutocompleteModule } from '@blockframes/ui/autocomplete/autocomplete.module';
import { TimePickerModule } from '@blockframes/ui/form/time-picker/time-picker.module';
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';
import { GroupMultiselectModule } from '@blockframes/ui/static-autocomplete/group/group.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ExpenseTypesModule } from '../../expense/expense-types/expense-types.module';

// Pages
import { WaterfallContractFormComponent } from './contract-form.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  declarations: [WaterfallContractFormComponent],
  exports: [WaterfallContractFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GroupMultiselectModule,
    AutocompleteModule,
    StaticSelectModule,
    FileUploaderModule,
    TimePickerModule,
    ExpenseTypesModule,

    // Material
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatDatepickerModule
  ],
})
export class WaterfallContractFormModule { }
