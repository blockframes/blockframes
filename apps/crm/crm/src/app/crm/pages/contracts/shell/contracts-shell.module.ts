import { NgModule } from '@angular/core';
import { ContractsShellComponent } from './contracts-shell.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: ContractsShellComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./../list/contracts-list.module').then(m => m.CrmContractsListModule)
      }
    ]
  }
]

@NgModule({
  declarations: [
    ContractsShellComponent,
  ],
  imports: [
    CommonModule,
    //Router
    RouterModule.forChild(routes)
  ],
})
export class CrmContractsShellModule { }
