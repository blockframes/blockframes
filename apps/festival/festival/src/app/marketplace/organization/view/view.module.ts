import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ViewComponent } from './view.component';

import { OrganizationViewModule as OrganizationLayoutModule } from '@blockframes/organization/organization/layout/view/view.module';

const routes = [{
  path: '',
  component: ViewComponent,
  children: [{
    path: '',
    redirectTo: 'title',
    pathMatch: 'full'
  }, {
    path: 'title',
    loadChildren: () => import('../title/title.module').then(m => m.OrganizationTitleModule)
  }, {
    path: 'member',
    loadChildren: () => import('../member/member.module').then(m => m.OrganizationMemberModule)
  }, {
    path: 'event',
    loadChildren: () => import('../event/event.module').then(m => m.OrganisationEventModule)
  }]
}]

@NgModule({
  declarations: [ViewComponent],
  imports: [
    CommonModule,
    OrganizationLayoutModule,
    RouterModule.forChild(routes)
  ]
})
export class OrganizationViewModule { }
