import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';

// Modules
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { UploadWidgetModule } from '@blockframes/media/file/upload-widget/upload-widget.module';
import { OrganizationAdminModule } from './pages/organization/organization.module';
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module';
import { AppPipeModule, ToLabelModule, DisplayNameModule, MaxLengthModule, JoinPipeModule, ToGroupLabelPipeModule } from '@blockframes/utils/pipes';
import { MemberPermissionsModule } from '@blockframes/organization/components/member-permissions/member-permissions.module';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { OverviewModule } from './pages/overview/overview.module';
import { InvitationsModule } from './pages/invitations/invitations.module';
import { EventModule } from './pages/event/event.module';
import { GoToModule } from './components/go-to/go-to.module';
import { AdminOrganizationFormModule } from './components/organization/forms/organization-form/organization-form.module';
import { MovieVideoUploadModule } from '@blockframes/movie/components/video-upload/video-upload.module';
import { MoviePictureUploadModule } from '@blockframes/movie/components/picture-upload/picture-upload.module';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { GetEventPipeModule } from '@blockframes/event/pipes/get-event.pipe';
import { ConfirmInputModule } from '@blockframes/ui/confirm-input/confirm-input.module';
import { StaticSelectModule } from "@blockframes/ui/static-autocomplete/select/static-select.module";
import { BreadCrumbModule } from './components/bread-crumb/bread-crumb.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { BuyingPreferencesModalModule } from './components/buying-preferences-modal/buying-preferences-modal.module';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';

// Components
import { OverviewComponent } from './pages/overview/overview.component';
import { OrganizationComponent } from './pages/organization/organization.component';
import { MovieComponent } from './pages/movie/movie.component';
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
  { path: 'movies', loadChildren: () => import('./pages/movies/movies.module').then(m => m.MovieListModule) },
  { path: 'movie/:movieId', component: MovieComponent },
  { path: 'organizations', loadChildren: () => import('./pages/organizations/organizations.module').then(m => m.OrganizationListModule) },
  { path: 'organization/:orgId', component: OrganizationComponent },
  { path: 'users', loadChildren: () => import('./pages/users/users.module').then(m => m.UserListModule) },
  { path: 'user/:userId', component: UserComponent },
  { path: 'events', component: EventsComponent },
  { path: 'event/:eventId', component: EventComponent },
  { path: 'invitations', component: InvitationsComponent },
  { path: 'mails', component: MailsComponent },
  { path: 'dev-area', component: DevAreaComponent },
  { path: 'offer', loadChildren: () => import('./pages/offers/list/offer-list.module').then(s => s.CrmOfferListModule) },
  { path: 'contracts', loadChildren: () => import('./pages/contracts/list/list.module').then(s => s.CrmContractsListModule) },
  { path: 'contracts/:contractId', loadChildren: () => import('./pages/contracts/view/view.module').then(s => s.ContractViewModule) },
  { path: 'contracts/:contractId/form', loadChildren: () => import('./pages/contracts/term-form/term-form.module').then(s => s.TermFormModule) },
  { path: 'offer/:offerId', loadChildren: () => import('./pages/offers/shell/shell.module').then(m => m.OfferShellModule) },
  { path: 'import', loadChildren: () => import('./pages/import/import.module').then(m => m.CrmImportModule) },
  { path: 'waterfalls', loadChildren: () => import('./pages/waterfall/list/list.module').then(m => m.ListModule) },
  { path: 'waterfall/:movieId', loadChildren: () => import('./pages/waterfall/view/view.module').then(m => m.WaterfallViewModule) },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,

    TableModule,
    ImageModule,
    AlgoliaAutocompleteModule,
    EventModule,
    OrganizationAdminModule,
    MaxLengthModule,
    ToLabelModule,
    ToGroupLabelPipeModule,
    JoinPipeModule,
    MemberPermissionsModule,
    MovieHeaderModule,
    OverviewModule,
    InvitationsModule,
    GoToModule,
    AdminOrganizationFormModule,
    MovieVideoUploadModule,
    ConfirmInputModule,
    AppPipeModule,
    MoviePictureUploadModule,
    StaticSelectModule,
    BreadCrumbModule,
    FormListModule,
    GetEventPipeModule,
    ClipboardModule,
    UploadWidgetModule,
    DisplayNameModule,
    BuyingPreferencesModalModule,
    OrgChipModule,

    RouterModule.forChild(panelRoutes),
  ],
  declarations: [
    MovieComponent,
    UserComponent,
    EventsComponent,
    MailsComponent,
    DevAreaComponent,
    OrganizationCreateComponent,
  ]
})
export class CrmModule { }
