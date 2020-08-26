import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';

// Guards
import { BlockframesAdminGuard } from '../admin-panel/guard/blockframes-admin.guard';

// Mobules
import { AuthWidgetModule } from '@blockframes/auth/components/widget/widget.module';
import { GoToAppModule } from '../admin-panel/pipes/go-to.pipe';

// Components
import { AdminComponent } from './admin/admin.component';
import { ToolbarTopComponent } from './toolbar-top/toolbar-top.component';
import { MatListModule } from '@angular/material/list';

export const adminRoutes: Routes = [
  { path: '',
    component: AdminComponent,
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
  declarations: [
    AdminComponent,
    ToolbarTopComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatListModule,
    GoToAppModule,
    MatIconModule,
    AuthWidgetModule,
    RouterModule.forChild(adminRoutes),
  ]
})
export class AdminModule {}
