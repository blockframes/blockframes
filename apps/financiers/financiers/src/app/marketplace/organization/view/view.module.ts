import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ViewComponent } from './view.component';

import { OrganizationViewModule as OrganizationLayoutModule } from '@blockframes/organization/layout/view/view.module';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';


const routes: Routes = [{
  path: '',
  component: ViewComponent,
  children: [{
    path: '',
    redirectTo: 'title',
    pathMatch: 'full'
  }, {
    path: 'title',
    loadChildren: () => import('../title/title.module').then(m => m.OrganizationTitleModule),
    data: { animation: 0 },
  }, {
    path: 'member',
    loadChildren: () => import('../member/member.module').then(m => m.OrganizationMemberModule),
    data: { animation: 1 },
  }]
}]

@NgModule({
  declarations: [ViewComponent],
  imports: [
    CommonModule,
    OrganizationLayoutModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild(routes)
  ]
})
export class OrganizationViewModule { }
