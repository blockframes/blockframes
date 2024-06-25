// Angular
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { StatementHeaderModule } from '../../statement-header/statement-header.module';
import { StatementParticipationModule } from '../../statement-participation/statement-participation.module';
import { StatementArbitraryChangeModule } from '../../statement-arbitrary-change/statement-arbitrary-change.module';
import { ExpenseTypePipeModule } from '../../../../pipes/expense-type.pipe';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Components
import { StatementDirectSalesSummaryComponent } from './summary.component';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [StatementDirectSalesSummaryComponent],
  imports: [
    BfCommonModule,
    ReactiveFormsModule,

    // Blockframes
    TableModule,
    StatementHeaderModule,
    StatementParticipationModule,
    StatementArbitraryChangeModule,
    ExpenseTypePipeModule,

    // Material
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  exports: [StatementDirectSalesSummaryComponent]
})
export class StatementDirectSalesSummaryModule { }
