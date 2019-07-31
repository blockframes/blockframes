// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pages
import { CatalogHomeComponent } from './home.component';

@NgModule({
  declarations: [CatalogHomeComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        component: CatalogHomeComponent
      }
    ])
  ]
})
export class HomeModule {}
