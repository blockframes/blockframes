// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Components
import { WaterfallEditComponent } from './waterfall-edit.component';
import { DashboardWaterfallShellModule } from '@blockframes/waterfall/dashboard/shell/shell.module';

const routes: Routes = [{
  path: '',
  component: WaterfallEditComponent,
  children: [
    {
      path: '',
      loadChildren: () => import('@blockframes/waterfall/dashboard/edit-waterfall/edit.module').then(m => m.WaterfallEditFormModule),
    },
  ]
}];

@NgModule({
  declarations: [WaterfallEditComponent],
  imports: [
    CommonModule,

    // Blockframes
    DashboardWaterfallShellModule,

    // Routes
    RouterModule.forChild(routes),
  ],
})
export class WaterfallEditModule { }
