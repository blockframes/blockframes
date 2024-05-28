import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { UploadWidgetModule } from '@blockframes/media/file/upload-widget/upload-widget.module';

@NgModule({
  declarations: [AppComponent],
  exports: [AppComponent],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    UploadWidgetModule,
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
