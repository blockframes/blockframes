import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

// Guards
import { BlockframesAdminGuard } from '@blockframes/admin/guard/blockframes-admin.guard';

// Mobules
import { AuthWidgetModule } from '@blockframes/auth/components/widget/widget.module';
import { GoToAppModule } from '@blockframes/admin/crm/pipes/go-to.pipe';

// Components
import { LayoutComponent } from './layout/layout.component';
import { ToolbarTopComponent } from './toolbar-top/toolbar-top.component';

export const adminRoutes: Routes = [
  { path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'crm', pathMatch: 'full' },
      { 
        path: 'crm',
        canActivate: [BlockframesAdminGuard],
        loadChildren: () => import('../crm/crm.module').then(m => m.CrmModule)
      },
    ]
  }
];

@NgModule({
  declarations: [
    LayoutComponent,
    ToolbarTopComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatListModule,
    MatIconModule,
    GoToAppModule,
    AuthWidgetModule,
    RouterModule.forChild(adminRoutes),
  ]
})
export class DashboardModule {}
