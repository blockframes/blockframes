import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material';

// Modules
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';

// Components
import { OverviewComponent } from './pages/overview/overview.component';
import { MovieComponent } from './pages/movies/movies.component';
import { DistributionDealsComponent } from './pages/distribution-deals/distribution-deals.component';
import { ContractsComponent } from './pages/contracts/contracts.component';
import { OrganizationsComponent } from './pages/organizations/organizations.component';

export const dashboardRoutes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: OverviewComponent },
  { path: 'movies', component: MovieComponent },
  { path: 'deals', component: DistributionDealsComponent },
  { path: 'deals/:movieId', component: DistributionDealsComponent },
  { path: 'contracts', component: ContractsComponent },
  { path: 'contracts/:movieId', component: ContractsComponent },
  { path: 'organizations', component: OrganizationsComponent },
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    FlexLayoutModule,
    TableFilterModule,
    ImageReferenceModule,
    RouterModule.forChild(dashboardRoutes),
  ],
  declarations: [
    OverviewComponent,
    MovieComponent,
    DistributionDealsComponent,
    ContractsComponent,
    OrganizationsComponent,
  ],
})
export class DashboardModule {}
