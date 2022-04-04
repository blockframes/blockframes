import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TitlesAnalyticsComponent } from './titles-analytics.component';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';

@NgModule({
  imports: [
    CommonModule,
    // Blockframes
    TableModule,
    // Router
    RouterModule.forChild([
      {
        path: '',
        component: TitlesAnalyticsComponent
      }
    ])
  ],
  declarations: [TitlesAnalyticsComponent]
})
export class TitlesAnalyticsModule {}