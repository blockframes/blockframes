// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Libraries
import { MovieListModule } from '@blockframes/movie/movie/components/movie-list/movie-list.module';
import { MovieCreateModule } from '@blockframes/movie/movie/components/movie-create/movie-create.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';

// Pages
import { DeliveryHomeComponent } from './home.component';

// Guard
import { MovieActiveGuard } from '@blockframes/movie/movie/guards/movie-active.guard';
import { MovieTitleFormComponent } from '@blockframes/movie/movie/components/movie-title-form/movie-title-form.component';


@NgModule({
  declarations: [DeliveryHomeComponent, MovieTitleFormComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieListModule,
    MovieCreateModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
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
  ],
  entryComponents: [MovieTitleFormComponent]
})
export class DeliveryHomeModule {}
