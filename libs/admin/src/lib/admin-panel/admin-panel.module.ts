import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Modules
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ContractTreeModule } from './components/contract-tree/contract-tree.module';
import { OrganizationAdminModule } from './pages/organization/organization.module';
import { AlgoliaAutocompleteModule } from '@blockframes/utils/algolia-autocomplete/algolia-autocomplete.module';
import { TermDateModule } from '@blockframes/utils/pipes/term-date.module';
import { TranslateObjectModule } from '@blockframes/utils/pipes/translate-object.module';

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
import { EditPartyComponent } from './components/edit-party/edit-party.component';
import { UsersComponent } from './pages/users/users.component';
import { UserComponent } from './pages/user/user.component';

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
  { path: 'users', component: UsersComponent },
  { path: 'user/:userId', component: UserComponent },
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCheckboxModule,
    FlexLayoutModule,
    TableFilterModule,
    ImageReferenceModule,
    AlgoliaAutocompleteModule,
    ContractTreeModule,
    RouterModule.forChild(panelRoutes),
    OrganizationAdminModule,
    TermDateModule,
    TranslateObjectModule,
  ],
  declarations: [
    OverviewComponent,
    MoviesComponent,
    DistributionDealsComponent,
    DistributionDealComponent,
    ContractsComponent,
    ContractComponent,
    OrganizationsComponent,
    MovieComponent,
    InvoicesComponent,
    InvoiceComponent,
    EditPartyComponent,
    UsersComponent,
    UserComponent,
  ],
  exports: [
    RouterModule,
  ]
})
export class AdminPanelModule { }
