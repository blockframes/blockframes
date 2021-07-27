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
import { BlockframesAdminGuard } from '@blockframes/admin/guard/blockframes-admin.guard';;

// Mobules
import { AuthWidgetModule } from '@blockframes/auth/components/widget/widget.module';
import { GoToAppModule } from '@blockframes/admin/crm/pipes/go-to.pipe';

// Components
import { LayoutComponent } from './layout/layout.component';
import { ToolbarTopComponent } from './toolbar-top/toolbar-top.component';
import { MatListModule } from '@angular/material/list';

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
    MatListModule,
    GoToAppModule,
    MatIconModule,
    AuthWidgetModule,
    RouterModule.forChild(adminRoutes),
  ]
})
export class DashboardModule {}
