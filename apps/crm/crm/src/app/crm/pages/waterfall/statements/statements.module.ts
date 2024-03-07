import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { StatementsComponent } from './statements.component';
import { StatementTableModule } from '@blockframes/waterfall/components/statement/statement-table/statement-table.module';
import { VersionSelectorModule } from '@blockframes/waterfall/components/version-selector/version-selector.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [StatementsComponent],
  imports: [
    CommonModule,

    StatementTableModule,
    VersionSelectorModule,
    ConfirmModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatDialogModule,

    RouterModule.forChild([{ path: '', component: StatementsComponent }])
  ]
})
export class StatementsModule { }
