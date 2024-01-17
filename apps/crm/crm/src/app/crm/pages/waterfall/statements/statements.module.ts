import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { StatementsComponent } from './statements.component';
import { StatementTableModule } from '@blockframes/waterfall/components/statement-table/statement-table.module';
import { VersionSelectorModule } from '@blockframes/waterfall/components/version-selector/version-selector.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [StatementsComponent],
  imports: [
    CommonModule,

    StatementTableModule,
    VersionSelectorModule,

    MatIconModule,
    MatButtonModule,

    RouterModule.forChild([{ path: '', component: StatementsComponent }])
  ]
})
export class StatementsModule { }
