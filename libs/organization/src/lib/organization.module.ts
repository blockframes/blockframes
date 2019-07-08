import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { AuthModule } from '@blockframes/auth';

// Material
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

// Components
import { OrgFormComponent } from './components/org-form/org-form.component';
import { MemberFormComponent } from './components/member-form/member-form.component';
import { OrgWidgetComponent } from './components/org-widget/org-widget.component';
import { OrganizationHomeComponent } from './pages/organization-home/organization-home.component';

// Pages
import { OrgViewComponent } from './pages/org-view/org-view.component';
import { MemberListComponent } from './pages/member-list/member-list.component';
import { MemberViewComponent } from './pages/member-view/member-view.component';

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
    component: OrgViewComponent
  }
];


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AuthModule,
    FlexLayoutModule,

    // Material
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
    RouterModule.forChild(organizationRoutes)
  ],
  declarations: [
    OrgFormComponent,
    OrgViewComponent,
    OrgWidgetComponent,
    MemberListComponent,
    MemberViewComponent,
    MemberFormComponent
  ],
  exports: [
    OrgWidgetComponent
  ]
})
export class OrganizationModule {
}
