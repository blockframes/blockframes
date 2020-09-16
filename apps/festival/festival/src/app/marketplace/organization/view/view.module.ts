import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ViewComponent } from './view.component';

import { OrganizationViewModule as OrganizationLayoutModule } from '@blockframes/organization/layout/view/view.module';

const routes = [{
  path: '',
  component: ViewComponent,
  children: [{
    path: '',
    redirectTo: 'title',
    pathMatch: 'full'
  }, {
    path: 'title',
    loadChildren: () => import('../title/title.module').then(m => m.OrganizationTitleModule),
    data: { animation: '0' }
  }, {
    path: 'member',
    loadChildren: () => import('../member/member.module').then(m => m.OrganizationMemberModule),
    data: { animation: '1' }
  }, {
    path: 'screening',
    loadChildren: () => import('../screening/screening.module').then(m => m.ScreeningModule),
    data: { animation: '2' }
  // Put the meeting tab in comment to prevent users to go in
  // }, {
  //   path: 'meeting',
  //   loadChildren: () => import('../meeting/meeting.module').then(m => m.MeetingModule)
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
