// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pages
import { DashboardCardComponent } from './dashboard-card.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [DashboardCardComponent],
  imports: [
    CommonModule,
    ImageModule,

    // Material
    MatIconModule,
  ],
  exports: [DashboardCardComponent]
})
export class DashboardCardModule { }
