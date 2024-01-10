// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pages
import { StatementHeaderComponent } from './statement-header.component';

// Blockframes
import { JoinPipeModule, ToLabelModule } from '@blockframes/utils/pipes';
import { VersionSelectorModule } from '../version-selector/version-selector.module';

// Material
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [StatementHeaderComponent],
  imports: [
    CommonModule,

    ToLabelModule,
    JoinPipeModule,
    VersionSelectorModule,

    // Material
    MatIconModule,
  ],
  exports: [StatementHeaderComponent]
})
export class StatementHeaderModule { }
