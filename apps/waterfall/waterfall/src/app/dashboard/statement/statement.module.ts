// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { StatementComponent } from './statement.component';
import { DashboardWaterfallShellModule } from '@blockframes/waterfall/dashboard/shell/shell.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Guards
import { StatementActiveGuard } from '@blockframes/waterfall/guards/statement-active.guard';
import { StatementFormGuard } from '@blockframes/waterfall/guards/statement-form.guard';

const routes: Routes = [{
  path: '',
  component: StatementComponent,
  children: [
    {
      path: '',
      redirectTo: 'create',
      pathMatch: 'full'
    },
    {
      path: ':statementId',
      canActivate: [StatementActiveGuard, StatementFormGuard],
      children: [
        {
          path: '',
          loadChildren: () => import('./view/view.module').then(m => m.StatementViewModule),
        },
        {
          path: 'edit',
          loadChildren: () => import('./edit/edit.module').then(m => m.StatementEditModule),
        },
      ],
      data: {
        redirect: '/c/o/dashboard/title'
      },
    },
  ]
}];

@NgModule({
  declarations: [StatementComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Blockframes
    DashboardWaterfallShellModule,

    // Material
    MatIconModule,
    MatButtonModule,

    // Routes
    RouterModule.forChild(routes),
  ],
})
export class StatementModule { }
