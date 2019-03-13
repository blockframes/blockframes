import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatToolbarModule
} from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, AuthModule } from '@blockframes/auth';
import { OrgFormComponent } from './org-form/org-form.component';
import { OrgListComponent } from './org-list/org-list.component';
import { OrgShowComponent } from './org-show/org-show.component';
import { OrgWidgetComponent } from './org-widget/org-widget.component';
import { OrgMembersShowComponent } from './org-members-show/org-members-show.component';

export const organizationRoutes: Routes = [
  {
    path: '_new',
    component: OrgFormComponent,
    canActivate: [AuthGuard],
    data: { fallback: '', org: null }
  },
  {
    path: '_list',
    component: OrgListComponent,
    canActivate: [AuthGuard],
    data: { fallback: '' }
  },
  {
    path: ':id',
    component: OrgShowComponent,
    canActivate: [AuthGuard],
    data: { fallback: '' }
  }
];


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatDividerModule,
    MatToolbarModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    AuthModule,
    RouterModule.forChild(organizationRoutes)
  ],
  declarations: [
    OrgListComponent,
    OrgFormComponent,
    OrgShowComponent,
    OrgWidgetComponent,
    OrgMembersShowComponent
  ],
  exports: [
    OrgListComponent,
    OrgFormComponent,
    OrgShowComponent,
    OrgMembersShowComponent,
    OrgWidgetComponent,
    RouterModule
  ]
})
export class OrganizationModule {
}
