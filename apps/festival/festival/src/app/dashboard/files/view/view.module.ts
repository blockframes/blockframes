// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { FilesViewComponent } from './view.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';

const routes: Routes = [{
  path: '',
  component: FilesViewComponent,
  children: [
    {
      path: '',
      redirectTo: 'organization',
      pathMatch: 'full'
    },
    {
      path: 'organization',
      loadChildren: () => import('../organization/organization.module').then(m => m.OrganizationResourcesModule)
    }
  ]
}]

@NgModule({
  declarations: [FilesViewComponent],
  imports: [
    CommonModule,

    // Material
    MatTabsModule,

    // Routing
    RouterModule.forChild(routes)
  ],
})
export class FilesViewModule { }
