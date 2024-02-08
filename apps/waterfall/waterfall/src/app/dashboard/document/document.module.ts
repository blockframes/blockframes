// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Components
import { DocumentComponent } from './document.component';
import { DashboardWaterfallShellModule } from '@blockframes/waterfall/dashboard/shell/shell.module';

// Guards
import { DocumentActiveGuard } from '@blockframes/waterfall/guards/document-active.guard';

const routes: Routes = [{
  path: '',
  component: DocumentComponent,
  children: [
    {
      path: '',
      redirectTo: 'create',
      pathMatch: 'full'
    },
    {
      path: ':documentId',
      canActivate: [DocumentActiveGuard],
      children: [
        {
          path: '',
          redirectTo: 'contract',
          pathMatch: 'full'
        },
        {
          path: 'contract',
          loadChildren: () => import('./contract/view/view.module').then(m => m.ContractViewModule),
        },
      ],
      data: {
        redirect: '/c/o/dashboard/title'
      },
    },
  ]
}];

@NgModule({
  declarations: [DocumentComponent],
  imports: [
    CommonModule,

    // Blockframes
    DashboardWaterfallShellModule,

    // Routes
    RouterModule.forChild(routes),
  ],
})
export class DocumentModule { }
