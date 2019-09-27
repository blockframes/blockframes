// Material
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material';
// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CardStatComponent } from './card-stat/card-stat.component';
import { CardHistoryComponent } from './card-history/card-history.component';
import { ManagementComponent } from './management/management.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CardInvestorComponent } from './card-investor/card-investor.component';
import { CardBlacklistComponent } from './card-blacklist/card-blacklist.component';
import { CardViewComponent } from './card-view/card-view.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'list', //@todo this redirect is temporary till routes uniformization
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'management',
    component: ManagementComponent
  }
];

@NgModule({
  declarations: [
    HomeComponent,
    DashboardComponent,
    CardStatComponent,
    CardHistoryComponent,
    CardInvestorComponent,
    CardBlacklistComponent,
    CardViewComponent,
    ManagementComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    FlexLayoutModule
  ],
  providers: [],
  bootstrap: []
})
export class FinancingModule {
}
