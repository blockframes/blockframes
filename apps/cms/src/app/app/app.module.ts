import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [AppComponent],
  exports: [AppComponent],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    RouterModule.forChild([{
      path: '',
      component: AppComponent,
      children: [{
        path: ':page',
        loadChildren: () => import('../page/page.module').then(m => m.PageModule)
      }]
    }])
  ]
})
export class AppModule { }
