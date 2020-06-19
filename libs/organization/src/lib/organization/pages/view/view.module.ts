import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImgModule } from '@blockframes/ui/media/img/img.module';
import { UserGuard } from '@blockframes/user/guard/user.guard';
import { OrgAddressModule } from '@blockframes/organization/pipes/org-address.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';

import { OrganizationViewComponent } from './view.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';
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
      canActivate: [UserGuard],
      canDeactivate: [UserGuard],
      loadChildren: () => import('@blockframes/organization/pages/member/member.module').then(m => m.MemberModule)
    },
  ]
}]

@NgModule({
  declarations: [OrganizationViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImgModule,
    OrgAddressModule,
    ToLabelModule,
    // Material
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild(routes)
  ]
})
export class OrganizationViewModule { }
