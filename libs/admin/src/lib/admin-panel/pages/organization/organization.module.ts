import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Components
import { OrganizationComponent } from './organization.component';

// Modules
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { OrganizationDisplayModule } from '@blockframes/organization/components/organization-display/organization-display.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { CropperModule } from '@blockframes/media/components/cropper/cropper.module';
import { MemberRepertoryModule } from '@blockframes/organization/components/member-repertory/member-repertory.module';
import { MemberPendingModule } from '@blockframes/organization/components/member-pending/member-pending.module';
import { MemberRequestModule } from '@blockframes/organization/components/member-request/member-request.module';
import { MemberAddModule } from '@blockframes/organization/components/member-add/member-add.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { GoToModule } from '../../components/go-to/go-to.module';
import { AdminOrganizationFormModule } from '../../components/organization/forms/organization-form/organization-form.module';

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
    FlexLayoutModule,
    OrganizationDisplayModule,
    TableFilterModule,
    ImageReferenceModule,
    CropperModule,
    MemberRepertoryModule,
    MemberPendingModule,
    MemberRequestModule,
    MemberAddModule,
    OrgNameModule,
    GoToModule,
    AdminOrganizationFormModule,
  ],
  declarations: [
    OrganizationComponent,
  ],
  exports: [
    OrganizationComponent
  ]
})
export class OrganizationAdminModule { }
