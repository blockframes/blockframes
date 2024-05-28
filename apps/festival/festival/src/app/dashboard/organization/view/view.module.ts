import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ViewComponent } from './view.component';

import { OrganizationViewModule as OrganizationLayoutModule } from '@blockframes/organization/layout/view/view.module';
import { MatButtonModule } from '@angular/material/button';

const routes = [{
  path: '',
  component: ViewComponent,
  children: [{
    path: '',
    loadChildren: () => import('../member/member.module').then(m => m.OrganizationMemberModule),
  }]
}]

@NgModule({
  declarations: [ViewComponent],
  imports: [
    CommonModule,
    OrganizationLayoutModule,
    MatButtonModule,
    RouterModule.forChild(routes)
  ]
})
export class OrganizationViewModule { }
