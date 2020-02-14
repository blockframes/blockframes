import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatIconModule,
  MatCardModule,
  MatFormFieldModule,
  MatCheckboxModule,
  MatInputModule,
  MatSelectModule,
  MatButtonModule 
} from '@angular/material';

// Modules
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';

// Components
import { OverviewComponent } from './pages/overview/overview.component';
import { MoviesComponent } from './pages/movies/movies.component';
import { DistributionDealsComponent } from './pages/distribution-deals/distribution-deals.component';
import { ContractsComponent } from './pages/contracts/contracts.component';
import { OrganizationsComponent } from './pages/organizations/organizations.component';
import { OrganizationComponent } from './pages/organization/organization.component';
import { MovieComponent } from './pages/movie/movie.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { InvoiceComponent } from './pages/invoice/invoice.component';
import { ContractComponent } from './pages/contract/contract.component';
import { DistributionDealComponent } from './pages/distribution-deal/distribution-deal.component';

export const panelRoutes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: OverviewComponent },
  { path: 'movies', component: MoviesComponent },
  { path: 'deals', component: DistributionDealsComponent },
  { path: 'deals/:movieId', component: DistributionDealsComponent },
  { path: 'deal/:dealId/m/:movieId', component: DistributionDealComponent },
  { path: 'contracts', component: ContractsComponent },
  { path: 'contracts/:movieId', component: ContractsComponent },
  { path: 'contract/:contractId', component: ContractComponent },
  { path: 'organizations', component: OrganizationsComponent },
  { path: 'organization/:orgId', component: OrganizationComponent },
  { path: 'movie/:movieId', component: MovieComponent },
  { path: 'invoices', component: InvoicesComponent },
  { path: 'invoice/:invoiceId', component: InvoiceComponent },
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    FlexLayoutModule,
    TableFilterModule,
    ImageReferenceModule,
    RouterModule.forChild(panelRoutes),
  ],
  declarations: [
    OverviewComponent,
    MoviesComponent,
    DistributionDealsComponent,
    DistributionDealComponent,
    ContractsComponent,
    ContractComponent,
    OrganizationsComponent,
    OrganizationComponent,
    MovieComponent,
    InvoicesComponent,
    InvoiceComponent,
  ],
  exports: [RouterModule]
})
export class AdminPanelModule { }
