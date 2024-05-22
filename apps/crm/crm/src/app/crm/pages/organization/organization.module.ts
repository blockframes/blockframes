import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Materials
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

// Components
import { OrganizationComponent } from './organization.component';

// Modules
import { OrganizationDisplayModule } from '@blockframes/organization/components/organization-display/organization-display.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MemberRepertoryModule } from '@blockframes/organization/components/member-repertory/member-repertory.module';
import { MemberPendingModule } from '@blockframes/organization/components/member-pending/member-pending.module';
import { MemberRequestModule } from '@blockframes/organization/components/member-request/member-request.module';
import { MemberAddModule } from '@blockframes/organization/components/member-add/member-add.module';
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
