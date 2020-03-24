import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { UserGuard } from '@blockframes/user/guard/user.guard';

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
      loadChildren: () => import('@blockframes/organization/organization/pages/organization/organization.module').then(m => m.OrganizationModule)
    },
    {
      path: 'members',
      canActivate: [UserGuard],
      canDeactivate: [UserGuard],
      loadChildren: () => import('@blockframes/organization/organization/pages/member/member.module').then(m => m.MemberModule)
    },
  ]
}]

@NgModule({
  declarations: [OrganizationViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,
    // Material
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild(routes)
  ]
})
export class OrganizationViewModule { }
