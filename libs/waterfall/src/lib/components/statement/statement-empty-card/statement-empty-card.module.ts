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
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

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
