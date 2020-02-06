import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const adminRoutes: Routes = [
  { path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard',
        // canActivate: [SomeGuardIfNeeded],
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule)
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
