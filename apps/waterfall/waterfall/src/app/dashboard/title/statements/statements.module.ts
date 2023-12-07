// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Blockframes
import { RightholderSelectModule } from '@blockframes/waterfall/components/rightholder-select/rightholder-select.module';
import { EmptyWaterfallModule } from '@blockframes/waterfall/components/empty/empty.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { EmptyStatementCardModule } from '@blockframes/waterfall/components/empty-statement-card/empty-statement-card.module';
import { RightHolderNamePipeModule } from '@blockframes/waterfall/pipes/rightholder-name.pipe';
import { StatementTableModule } from '@blockframes/waterfall/components/statement-table/statement-table.module';
import { StatementNewModule } from '@blockframes/waterfall/components/statement-new/statement-new.module';

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

@NgModule({
  declarations: [StatementsComponent],
  imports: [
    CommonModule,

    RightholderSelectModule,
    EmptyWaterfallModule,
    ToLabelModule,
    EmptyStatementCardModule,
    RightHolderNamePipeModule,
    StatementTableModule,
    StatementNewModule,

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

    // Routing
    RouterModule.forChild([{ path: '', component: StatementsComponent }]),
  ],
})
export class StatementsModule { }
