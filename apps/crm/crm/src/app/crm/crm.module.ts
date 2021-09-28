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
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { OrganizationAdminModule } from './pages/organization/organization.module';
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module';
import { AppPipeModule, ToLabelModule, ToDateModule } from '@blockframes/utils/pipes';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
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
import { ConfirmInputModule } from '@blockframes/ui/confirm-input/confirm-input.module';
import { StaticSelectModule } from "@blockframes/ui/static-autocomplete/select/static-select.module";
import { DashboardModule } from './components/dashboard/dashboard.module';
import { BreadCrumbModule } from './components/bread-crumb/bread-crumb.module';

export const panelRoutes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: OverviewComponent },
  { path: 'movies', loadChildren: () => import('./pages/movies/movies.module').then(m => m.MovieListModule)},
  { path: 'movie/:movieId', component: MovieComponent },
  { path: 'organizations', loadChildren: () => import('./pages/organizations/organizations.module').then(m => m.OrganizationListModule)},
  { path: 'organization/:orgId', component: OrganizationComponent },
  { path: 'users', loadChildren: () => import('./pages/users/users.module').then(m => m.UserListModule)},
  { path: 'user/:userId', component: UserComponent },
  { path: 'events', component: EventsComponent },
  { path: 'event/:eventId', component: EventComponent },
  { path: 'invitations', component: InvitationsComponent },
  { path: 'mails', component: MailsComponent },
  { path: 'dev-area', component: DevAreaComponent },
  { path: 'offer', loadChildren:() => import('./pages/offers/list/offer-list.module').then(s => s.CrmOfferListModule) },
  { path: 'offer/:offerId', loadChildren: () => import('./pages/offers/shell/shell.module').then(m => m.OfferShellModule) },
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
    ImageModule,
    AlgoliaAutocompleteModule,
    EventModule,
    RouterModule.forChild(panelRoutes),
    OrganizationAdminModule,
    ToLabelModule,
    OrgNameModule,
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
    ToDateModule,
    DashboardModule,
    BreadCrumbModule,
    FormListModule
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
