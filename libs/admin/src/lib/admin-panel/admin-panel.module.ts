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
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ContractTreeModule } from './components/contract-tree/contract-tree.module';
import { OrganizationAdminModule } from './pages/organization/organization.module';
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module';
import { TermDateModule } from '@blockframes/utils/pipes/term-date.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { EditTitleModule } from './components/edit-title/edit-title.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.pipe';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { MemberPermissionsModule } from '@blockframes/organization/components/member-permissions/member-permissions.module';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { OverviewModule } from './pages/overview/overview.module';
import { InvitationsModule } from './pages/invitations/invitations.module';
import { EventModule } from './pages/event/event.module';
import { GoToModule } from './components/go-to/go-to.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';
import { AdminOrganizationFormModule } from './components/organization/forms/organization-form/organization-form.module';
import { MovieVideoUploadModule } from '@blockframes/movie/components/video-upload/video-upload.module';

// Components
import { OverviewComponent } from './pages/overview/overview.component';
import { MoviesComponent } from './pages/movies/movies.component';
import { DistributionRightsComponent } from './pages/distribution-rights/distribution-rights.component';
import { ContractsComponent } from './pages/contracts/contracts.component';
import { OrganizationsComponent } from './pages/organizations/organizations.component';
import { OrganizationComponent } from './pages/organization/organization.component';
import { MovieComponent } from './pages/movie/movie.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { InvoiceComponent } from './pages/invoice/invoice.component';
import { ContractComponent } from './pages/contract/contract.component';
import { DistributionRightComponent } from './pages/distribution-right/distribution-right.component';
import { EditPartyComponent } from './components/edit-party/edit-party.component';
import { UsersComponent } from './pages/users/users.component';
import { UserComponent } from './pages/user/user.component';
import { EventsComponent } from './pages/events/events.component';
import { EventComponent } from './pages/event/event.component';
import { MailsComponent } from './pages/mails/mails.component';
import { DevAreaComponent } from './pages/dev-area/dev-area.component';
import { InvitationsComponent } from './pages/invitations/invitations.component';
import { OrganizationCreateComponent } from './components/organization/create-organization/create.component';

export const panelRoutes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: OverviewComponent },
  { path: 'movies', component: MoviesComponent },
  { path: 'rights', component: DistributionRightsComponent },
  { path: 'rights/:movieId', component: DistributionRightsComponent },
  { path: 'right/:rightId/m/:movieId', component: DistributionRightComponent },
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
  { path: 'events', component: EventsComponent },
  { path: 'event/:eventId', component: EventComponent },
  { path: 'invitations', component: InvitationsComponent },
  { path: 'mails', component: MailsComponent },
  { path: 'dev-area', component: DevAreaComponent }
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
    EditTitleModule,
    EventModule,
    RouterModule.forChild(panelRoutes),
    OrganizationAdminModule,
    TermDateModule,
    ToLabelModule,
    TranslateSlugModule,
    OrgNameModule,
    MemberPermissionsModule,
    MovieHeaderModule,
    OverviewModule,
    InvitationsModule,
    GoToModule,
    ConfirmModule,
    AdminOrganizationFormModule,
    MovieVideoUploadModule,
  ],
  declarations: [
    MoviesComponent,
    DistributionRightsComponent,
    DistributionRightComponent,
    ContractsComponent,
    ContractComponent,
    OrganizationsComponent,
    MovieComponent,
    InvoicesComponent,
    InvoiceComponent,
    EditPartyComponent,
    UsersComponent,
    UserComponent,
    EventsComponent,
    MailsComponent,
    DevAreaComponent,
    OrganizationCreateComponent,
  ]
})
export class AdminPanelModule { }
