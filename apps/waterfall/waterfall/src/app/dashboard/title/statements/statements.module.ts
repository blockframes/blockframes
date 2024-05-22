// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Blockframes
import { RightholderSelectModule } from '@blockframes/waterfall/components/rightholder/rightholder-select/rightholder-select.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { StatementEmptyCardModule } from '@blockframes/waterfall/components/statement/statement-empty-card/statement-empty-card.module';
import { StatementTableModule } from '@blockframes/waterfall/components/statement/statement-table/statement-table.module';
import { StatementNewModule } from '@blockframes/waterfall/components/statement/statement-new/statement-new.module';
import { VersionSelectorModule } from '@blockframes/waterfall/components/version/version-selector/version-selector.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';

// Pages
import { StatementsComponent } from './statements.component';

// Material
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

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
