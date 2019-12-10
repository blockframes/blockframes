// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';

// Pages
import { DeliveryHomeComponent } from './home.component';

// Components
import { MovieCardModule } from '@blockframes/ui/movie-card/movie-card.module';
import { MovieCreateModule } from '@blockframes/movie/movie/components/movie-create/movie-create.module';
import { MovieTitleFormComponent } from '@blockframes/movie/movie/components/movie-title-form/movie-title-form.component';
import { PicturesThemeModule } from '@blockframes/ui';

// Guard
import { MovieActiveGuard } from '@blockframes/movie/movie/guards/movie-active.guard';


@NgModule({
  declarations: [DeliveryHomeComponent, MovieTitleFormComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieCardModule,
    MovieCreateModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule,
    PicturesThemeModule,
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
