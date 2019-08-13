// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Material
import { MatButtonModule } from '@angular/material/button';

// Libraries
import { FlexLayoutModule } from '@angular/flex-layout';

// Pages
import { CatalogDashboardHomeComponent } from './dashboard-home.component';

@NgModule({
  declarations: [CatalogDashboardHomeComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    FlexLayoutModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        component: CatalogDashboardHomeComponent
      }
    ])
  ]
})
export class DashboardHomeModule {}
