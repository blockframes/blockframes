import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { ViewComponent } from './view.component';

const routes = [
  {
    path: '',
    component: ViewComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('../negotiation/negotiation.module').then(m => m.NegotiationModule)
      }
    ]
  }
];

@NgModule({
  declarations: [ViewComponent],
  imports: [CommonModule, FlexLayoutModule, AppLogoModule, RouterModule.forChild(routes)]
})
export class RightViewModule {}
