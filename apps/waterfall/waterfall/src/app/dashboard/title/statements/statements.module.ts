// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Blockframes
import { RightholderSelectModule } from '@blockframes/waterfall/components/rightholder/rightholder-select/rightholder-select.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { StatementEmptyCardModule } from '@blockframes/waterfall/components/statement/statement-empty-card/statement-empty-card.module';
import { StatementTableModule } from '@blockframes/waterfall/components/statement-table/statement-table.module';
import { StatementNewModule } from '@blockframes/waterfall/components/statement-new/statement-new.module';
import { VersionSelectorModule } from '@blockframes/waterfall/components/version-selector/version-selector.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';

// Pages
import { StatementsComponent } from './statements.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [StatementsComponent],
  imports: [
    CommonModule,

    RightholderSelectModule,
    ToLabelModule,
    StatementEmptyCardModule,
    StatementTableModule,
    StatementNewModule,
    VersionSelectorModule,
    LogoSpinnerModule,
    ConfirmModule,

    // Material
    MatFormFieldModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatMenuModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,

    // Routing
    RouterModule.forChild([{ path: '', component: StatementsComponent }]),
  ],
})
export class StatementsModule { }
