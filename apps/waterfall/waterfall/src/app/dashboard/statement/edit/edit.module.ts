// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { StatementHeaderModule } from '@blockframes/waterfall/components/statement-header/statement-header.module';
import { StatementPeriodModule } from '@blockframes/waterfall/components/statement-period/statement-period.module';
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { GroupMultiselectModule } from '@blockframes/ui/static-autocomplete/group/group.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';

// Components
import { StatementEditComponent } from './edit.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [StatementEditComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Blockframes
    StatementHeaderModule,
    StatementPeriodModule,
    FormTableModule,
    ToGroupLabelPipeModule,
    MaxLengthModule,
    JoinPipeModule,
    PricePerCurrencyModule,
    GroupMultiselectModule,
    StaticSelectModule,

    // Material
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,

    // Routing
    RouterModule.forChild([{ path: '', component: StatementEditComponent }]),
  ],
})
export class StatementEditModule { }
