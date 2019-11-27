
// ANGULAR
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// MATERIAL
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// UI
import { AvatarListModule } from '@blockframes/ui/avatar-list/avatar-list.module';
import { EditableSidenavModule } from '@blockframes/ui/editable-sidenav/editable-sidenav.module';

// GUARDS
import { DaoGuard } from './guards/dao.guard';

// COMPONENTS
import { DaoSignerFormComponent } from './components/dao-signer-form/dao-signer-form.component';
import { DaoFormOperationComponent } from './components/dao-form-operation/dao-form-operation.component';
import { DaoDisplayActionsComponent } from './components/dao-display-actions/dao-display-actions.component';
import { DaoSignerRepertoryComponent } from './components/dao-signer-repertory/dao-signer-repertory.component';
import { DaoDisplayOperationsComponent } from './components/dao-display-operations/dao-display-operations.component';

// PAGES
import { DaoAdminViewComponent } from './pages/dao-admin-view/dao-admin-view.component';
import { DaoActivityViewComponent } from './pages/dao-activity-view/dao-activity-view.component';

export const daoRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'administration' },
      {
        path: 'administration',
        canActivate: [DaoGuard],
        canDeactivate: [DaoGuard],
        component: DaoAdminViewComponent,
      },
      {
        path: 'history',
        canActivate: [DaoGuard],
        canDeactivate: [DaoGuard],
       component: DaoActivityViewComponent,
      },
    ]
  },
];
@NgModule({
  imports: [
    // ANGULAR
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(daoRoutes),

    // MATERIAL
    MatProgressBarModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatListModule,
    MatSelectModule,
    MatButtonModule,

    // UI
    AvatarListModule,
    EditableSidenavModule,
  ],
  declarations: [
    // COMPONENT
    DaoSignerFormComponent,
    DaoFormOperationComponent,
    DaoDisplayActionsComponent,
    DaoSignerRepertoryComponent,
    DaoDisplayOperationsComponent,

    // PAGES
    DaoAdminViewComponent,
    DaoActivityViewComponent,
  ]
})
export class DaoModule {}
