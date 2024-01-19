// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pages
import { StatementHeaderComponent } from './statement-header.component';

// Blockframes
import { ToLabelModule } from '@blockframes/utils/pipes';
import { VersionSelectorModule } from '../version-selector/version-selector.module';
import { StatementMainInfoModule } from '../statement-main-info/statement-main-info.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [StatementHeaderComponent],
  imports: [
    CommonModule,

    ToLabelModule,
    VersionSelectorModule,
    StatementMainInfoModule,

    // Material
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [StatementHeaderComponent]
})
export class StatementHeaderModule { }
