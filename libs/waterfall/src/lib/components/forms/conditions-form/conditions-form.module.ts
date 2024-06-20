
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { ExpenseTypeCapPipe, WaterfallConditionsFormComponent } from './conditions-form.component';

// Blockframes
import { GroupMultiselectModule } from '@blockframes/ui/static-autocomplete/group/group.module';
import { ChipsAutocompleteModule } from "@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module";
import { ToLabelModule } from '@blockframes/utils/pipes';
import { ExpenseTypesModalModule } from '../../expense/expense-types-modal/expense-types-modal.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [WaterfallConditionsFormComponent, ExpenseTypeCapPipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    GroupMultiselectModule,
    ChipsAutocompleteModule,
    ToLabelModule,
    ExpenseTypesModalModule,

    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  exports: [WaterfallConditionsFormComponent],
})
export class WaterfallConditionsFormModule { }
