import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { OrganizationFormModule } from '@blockframes/organization/forms/organization-form/organization-form.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { AvatarListModule } from '@blockframes/ui/avatar-list/avatar-list.module';
import { MemberPermissionsModule } from '@blockframes/organization/components/member-permissions/member-permissions.module';

// Components
import { MemberComponent } from './member.component';
import { MemberRepertoryComponent } from '@blockframes/organization/components/member-repertory/member-repertory.component';
import { MemberRequestComponent } from '@blockframes/organization/components/member-request/member-request.component';
import { MemberPendingComponent } from '@blockframes/organization/components/member-pending/member-pending.component';
import { MemberAddComponent } from '@blockframes/organization/components/member-add/member-add.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Material
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    MemberComponent,
    MemberRepertoryComponent,
    MemberRequestComponent,
    MemberPendingComponent,
    MemberAddComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OrganizationFormModule,
    FlexLayoutModule,
    ImageReferenceModule,
    TableFilterModule,
    AvatarListModule,
    MemberPermissionsModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatListModule,
    RouterModule.forChild([{ path: '', component: MemberComponent }])
  ]
})
export class MemberModule { }
