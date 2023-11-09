// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { DashboardsComponent } from './dashboards.component';

// Modules
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { EmptyWaterfallModule } from '@blockframes/waterfall/components/empty/empty.module';

// Material
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [DashboardsComponent],
  imports: [
    CommonModule,

    TableModule,
    EmptyWaterfallModule,

    MatIconModule,
    MatButtonModule,
    MatTooltipModule,

    // Routing
    RouterModule.forChild([{ path: '', component: DashboardsComponent }]),
  ],
})
export class DashboardsModule { }
