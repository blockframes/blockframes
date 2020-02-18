import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ImgAssetModule } from '@blockframes/ui/theme';

import { ViewComponent } from './view.component';

const routes = [{
  path: '',
  component: ViewComponent,
  children: [{
    path: '',
    loadChildren: () => import('../negociation/negociation.module').then(m => m.NegociationModule)
  } ]
}]

@NgModule({
  declarations: [ViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImgAssetModule,
    RouterModule.forChild(routes)
  ]
})
export class DealViewModule { }
