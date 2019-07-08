import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule, Routes } from '@angular/router';
import { AuthModule } from '@blockframes/auth';
import { OrgFormComponent } from './org-form/org-form.component';
import { OrgShowComponent } from './org-show/org-show.component';
import { OrgMembersShowComponent } from './org-members-show/org-members-show.component';
import { OrgWidgetComponent } from './org-widget/org-widget.component';
import { OrganizationHomeComponent } from './pages/organization-home/organization-home.component';
import { FlexLayoutModule } from '@angular/flex-layout';

export const organizationRoutes: Routes = [
  {
    path: 'organization-home',
    component: OrganizationHomeComponent
  },
  {
    path: 'form',
    component: OrgFormComponent
  },
  {
    path: ':orgId',
    component: OrgShowComponent
  }
];


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatToolbarModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    AuthModule,
    FlexLayoutModule,
    RouterModule.forChild(organizationRoutes)
  ],
  declarations: [
    OrgFormComponent,
    OrgShowComponent,
    OrgMembersShowComponent,
    OrgWidgetComponent,
    OrganizationHomeComponent
  ],
  exports: [
    OrgWidgetComponent
  ]
})
export class OrganizationModule {
}
