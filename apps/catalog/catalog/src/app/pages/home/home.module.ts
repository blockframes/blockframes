// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Material
import { MatButtonModule } from '@angular/material/button';

// Libraries
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCarouselModule, MatCarouselComponent } from '@ngmodule/material-carousel';

// Pages
import { CatalogHomeComponent } from './home.component';

@NgModule({
  declarations: [CatalogHomeComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    FlexLayoutModule,
    MatCarouselModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'home', pathMatch: 'fulll' },
      {
        path: 'home',
        component: CatalogHomeComponent
      }
    ])
  ]
})
export class HomeModule {}
