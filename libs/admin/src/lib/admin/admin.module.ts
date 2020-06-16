import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlockframesAdminGuard } from '../admin-panel/guard/blockframes-admin.guard';

export const adminRoutes: Routes = [
  { path: '',
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      { 
        path: 'panel',
        canActivate: [BlockframesAdminGuard],
        loadChildren: () => import('../admin-panel/admin-panel.module').then(m => m.AdminPanelModule)
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(adminRoutes),
  ]
})
export class AdminModule {}
