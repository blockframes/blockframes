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
    redirectTo: 'titles',
    pathMatch: 'full'
  }, {
    path: 'titles',
    loadChildren: () => import('../titles/titles.module').then(m => m.OrganizationTitlesModule)
  }, {
    path: 'members',
    loadChildren: () => import('../members/members.module').then(m => m.OrganizationMembersModule)
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
