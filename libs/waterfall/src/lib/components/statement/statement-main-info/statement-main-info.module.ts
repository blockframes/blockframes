// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Pages
import { StatementMainInfoComponent } from './statement-main-info.component';

// Blockframes
import { JoinPipeModule } from '@blockframes/utils/pipes/join.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [StatementMainInfoComponent],
  imports: [
    CommonModule,

    JoinPipeModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,

    RouterModule,
  ],
  exports: [StatementMainInfoComponent]
})
export class StatementMainInfoModule { }
