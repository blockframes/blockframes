// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Libraries
import { MovieListModule } from '@blockframes/movie/movie/pages/movie-list/movie-list.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

// Pages
import { DeliveryHomeComponent } from './home.component';
import { MovieActiveGuard } from '@blockframes/movie/movie/guards/movie-active.guard';


@NgModule({
  declarations: [DeliveryHomeComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    RouterModule.forChild([
      {
        path: '',
        component: DeliveryHomeComponent
      },
      {
        path: ':movieId',
        canActivate: [MovieActiveGuard],
        canDeactivate: [MovieActiveGuard],
        loadChildren: () => import('@blockframes/movie').then(m => m.MovieModule)
      }
    ])
  ]
})
export class DeliveryHomeModule {}
