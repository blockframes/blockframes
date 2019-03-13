import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatToolbarModule
} from '@angular/material';
import { RouterModule } from '@angular/router';
import { OrgFormComponent } from './org-form/org-form.component';
import { OrgListComponent } from './org-list/org-list.component';
import { OrgShowComponent } from './org-show/org-show.component';
import { OrgMembersShowComponent } from './org-members-show/org-members-show.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatToolbarModule,
    MatInputModule,
    MatButtonModule,
    RouterModule.forChild([])
  ],
  declarations: [
    OrgListComponent,
    OrgFormComponent,
    OrgShowComponent,
    OrgMembersShowComponent
  ],
  exports: [
    OrgListComponent,
    OrgFormComponent,
    OrgShowComponent,
    OrgMembersShowComponent
  ]
})
export class OrganizationModule {
}
