import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TitlesAnalyticsComponent } from './titles-analytics.component';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

@NgModule({
  imports: [
    CommonModule,
    // Blockframes
    TableModule,
    LogoSpinnerModule,
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