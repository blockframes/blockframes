
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { BreadCrumbModule } from '../../components/bread-crumb/bread-crumb.module';

import { CrmImportComponent } from './import.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
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
    {
      path: 'documents',
      loadChildren: () => import('@blockframes/waterfall/import/documents/import.module').then(m => m.DocumentImportModule),
    },
    {
      path: 'imdb',
      loadChildren: () => import('./imdb/imdb-import.module').then(m => m.ImdbImportModule),
    },
    {
      path: 'sources',
      loadChildren: () => import('@blockframes/waterfall/import/sources/import.module').then(m => m.SourceImportModule),
    },
    {
      path: 'rights',
      loadChildren: () => import('@blockframes/waterfall/import/rights/import.module').then(m => m.RightImportModule),
    },
    {
      path: 'statements',
      loadChildren: () => import('@blockframes/waterfall/import/statements/import.module').then(m => m.StatementImportModule),
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
