// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  MatCardModule,
  MatGridListModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
  MatFormFieldModule,
  MatInputModule,
  MatCheckboxModule,
  MatSlideToggleModule,
} from '@angular/material';
import { MaterialCommonModule, MaterialLayoutModule } from '@blockframes/ui';
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
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MaterialLayoutModule,
    MaterialCommonModule,
    FlexLayoutModule
  ],
  providers: [],
  bootstrap: []
})
export class FinancingModule {
}
