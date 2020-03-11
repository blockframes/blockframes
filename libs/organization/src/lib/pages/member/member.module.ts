import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrganizationFormModule } from '@blockframes/organization/forms/organization-form/organization-form.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { AvatarListModule } from '@blockframes/ui';

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
    OrganizationFormModule,
    FlexLayoutModule,
    ImageReferenceModule,
    ImgAssetModule,
    TableFilterModule,
    AvatarListModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    RouterModule.forChild([{ path: '', component: MemberComponent }])
  ]
})
export class MemberModule { }
