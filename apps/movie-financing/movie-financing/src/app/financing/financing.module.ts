// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule, MatGridListModule, MatIconModule, MatListModule } from '@angular/material';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CardStatComponent } from './card-stat/card-stat.component';
import { MaterialCommonModule, MaterialLayoutModule } from '@blockframes/ui';
import { CardHistoryComponent } from './card-history/card-history.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  }
];

@NgModule({
  declarations: [HomeComponent, DashboardComponent, CardStatComponent, CardHistoryComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MaterialLayoutModule,
    MaterialCommonModule
  ],
  providers: [],
  bootstrap: []
})
export class FinancingModule {
}
