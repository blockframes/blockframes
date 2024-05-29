
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
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

@NgModule({
  declarations: [WaterfallConditionsFormComponent, ExpenseTypeCapPipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    GroupMultiselectModule,
    ChipsAutocompleteModule,
    ToLabelModule,
    ExpenseTypesModalModule,
    PricePerCurrencyModule,

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
