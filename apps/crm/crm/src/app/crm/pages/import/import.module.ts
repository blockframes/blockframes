
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { BreadCrumbModule } from '../../components/bread-crumb/bread-crumb.module';

import { CrmImportComponent } from './import.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [{
  path: '',
  component: CrmImportComponent,
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'titles',
    },
    {
      path: 'titles',
      loadChildren: () => import('@blockframes/movie/import/import.module').then(m => m.TitleImportModule),
    },
    {
      path: 'orgs',
      loadChildren: () => import('@blockframes/organization/import/import.module').then(m => m.OrgImportModule),
    },
    {
      path: 'contracts',
      loadChildren: () => import('@blockframes/contract/import/import.module').then(m => m.ContractImportModule),
    },
  ]
}];

@NgModule({
  declarations: [ CrmImportComponent ],
  imports: [
    CommonModule,

    MatIconModule,
    MatButtonModule,

    BreadCrumbModule,

    RouterModule.forChild(routes),
  ],
})
export class CrmImportModule { }
