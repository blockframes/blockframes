import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { AvatarListModule } from '@blockframes/ui';
import { MemberGuard } from '@blockframes/organization/member/guard/member.guard';

import { OrganizationViewComponent } from './view.component';
import { MemberEditableComponent } from '@blockframes/organization/pages/member-editable/member-editable.component';
import { MemberRepertoryComponent } from '@blockframes/organization/components/member-repertory/member-repertory.component';
import { MemberRequestComponent } from '@blockframes/organization/components/member-request/member-request.component';
import { MemberPendingComponent } from '@blockframes/organization/components/member-pending/member-pending.component';
import { MemberAddComponent } from '@blockframes/organization/components/member-add/member-add.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

const routes = [{
  path: '',
  component: OrganizationViewComponent,
  children: [
    {
      path: '',
      redirectTo: 'org',
      pathMatch: 'full'
    },
    {
      path: 'org',
      loadChildren: () => import('@blockframes/organization/pages/organization/organization.module').then(m => m.OrganizationModule)
    },
    {
      path: 'members',
      canActivate: [MemberGuard],
      canDeactivate: [MemberGuard],
      component: MemberEditableComponent
    },
  ]
}]

@NgModule({
  declarations: [
    OrganizationViewComponent,
    MemberEditableComponent,
    MemberRepertoryComponent,
    MemberRequestComponent,
    MemberPendingComponent,
    MemberAddComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    ImageReferenceModule,
    ImgAssetModule,
    TableFilterModule,
    AvatarListModule,
    // Material
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
    RouterModule.forChild(routes)
  ]
})
export class OrganizationViewModule { }
