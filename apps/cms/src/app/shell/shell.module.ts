import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { ShellComponent } from './shell.component';

const children: Route[] = [{
  path: '',
  redirectTo: 'festival',
  pathMatch: 'full',
}, {
  path: 'festival',
  loadChildren: () => import('../festival/festival.module').then(m => m.FestivalModule)
}]

@NgModule({
  declarations: [ShellComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ShellComponent, children }])
  ]
})
export class ShellModule { }
