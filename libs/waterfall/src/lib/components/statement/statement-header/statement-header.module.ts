// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pages
import { StatementHeaderComponent } from './statement-header.component';

// Blockframes
import { VersionSelectorModule } from '../../version/version-selector/version-selector.module';
import { StatementMainInfoModule } from '../statement-main-info/statement-main-info.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [StatementHeaderComponent],
  imports: [
    CommonModule,

    VersionSelectorModule,
    StatementMainInfoModule,

    // Material
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [StatementHeaderComponent]
})
export class StatementHeaderModule { }
