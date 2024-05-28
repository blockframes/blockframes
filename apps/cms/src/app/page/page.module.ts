import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageComponent } from './page.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';


@NgModule({
  declarations: [PageComponent],
  exports: [PageComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,

    RouterModule.forChild([{
      path: '',
      component: PageComponent
    }, {
      path: ':template',
      loadChildren: () => import('../template/template.module').then(m => m.TemplateModule)
    }])
  ]
})
export class PageModule { }
