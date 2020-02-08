import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { MemberGuard } from '@blockframes/organization/member/guard/member.guard';

import { OrganizationViewComponent } from './view.component';


// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
      loadChildren: () => import('@blockframes/organization/pages/members/members.module').then(m => m.MembersModule)
    },
  ]
}]

@NgModule({
  declarations: [OrganizationViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,
    ImgAssetModule,
    // Material
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild(routes)
  ]
})
export class OrganizationViewModule { }
