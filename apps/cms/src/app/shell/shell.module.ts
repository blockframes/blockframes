import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { ShellComponent } from './shell.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

const children: Route[] = [{
  path: '',
  redirectTo: 'festival',
  pathMatch: 'full',
}, {
  path: ':app',
  loadChildren: () => import('../app/app.module').then(m => m.AppModule)
}]

@NgModule({
  declarations: [ShellComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: ShellComponent, children }])
  ]
})
export class ShellModule { }
