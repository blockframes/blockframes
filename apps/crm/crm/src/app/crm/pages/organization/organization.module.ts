import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Materials
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';

// Components
import { OrganizationComponent } from './organization.component';

// Modules
import { OrganizationDisplayModule } from '@blockframes/organization/components/organization-display/organization-display.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MemberRepertoryModule } from '@blockframes/organization/components/member-repertory/member-repertory.module';
import { MemberPendingModule } from '@blockframes/organization/components/member-pending/member-pending.module';
import { MemberRequestModule } from '@blockframes/organization/components/member-request/member-request.module';
import { MemberAddModule } from '@blockframes/organization/components/member-add/member-add.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { GoToModule } from '../../components/go-to/go-to.module';
import { AdminOrganizationFormModule } from '../../components/organization/forms/organization-form/organization-form.module';
import { FileExplorerModule } from '@blockframes/media/file/explorer/explorer.module';
import { BreadCrumbModule } from '../../components/bread-crumb/bread-crumb.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { AppPipeModule, ToLabelModule, MaxLengthModule } from '@blockframes/utils/pipes';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule,
    MatDialogModule,
    FlexLayoutModule,
    OrganizationDisplayModule,
    TableModule,
    ImageModule,
    MemberRepertoryModule,
    MemberPendingModule,
    MemberRequestModule,
    MemberAddModule,
    OrgNameModule,
    GoToModule,
    AdminOrganizationFormModule,
    FileExplorerModule,
    AppPipeModule,
    ToLabelModule,
    MaxLengthModule,
    BreadCrumbModule
  ],
  declarations: [
    OrganizationComponent,
  ],
  exports: [
    OrganizationComponent
  ]
})
export class OrganizationAdminModule { }
