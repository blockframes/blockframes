// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Pages
import { StatementMainInfoComponent } from './statement-main-info.component';

// Blockframes
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [StatementMainInfoComponent],
  imports: [
    BfCommonModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,

    RouterModule,
  ],
  exports: [StatementMainInfoComponent]
})
export class StatementMainInfoModule { }
