// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Modules
import { ToLabelModule } from '@blockframes/utils/pipes';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Pages
import { StatementEmptyCardComponent } from './statement-empty-card.component';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [StatementEmptyCardComponent],
  imports: [
    CommonModule,
    RouterModule,

    ToLabelModule,
    ImageModule,

    // Material
    MatButtonModule,
    MatTooltipModule,
  ],
  exports: [StatementEmptyCardComponent]
})
export class StatementEmptyCardModule { }
