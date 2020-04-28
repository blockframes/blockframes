// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { ViewComponent } from './view.component';

// Custom Modules
import { MovieViewLayoutModule } from '@blockframes/movie/layout/view/view.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

const routes = [{
  path: '',
  component: ViewComponent,
  children: [{
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  }, {
    path: 'main',
    loadChildren: () => import('../main/main.module').then(m => m.MovieMainModule)
  }]
}];

@NgModule({
  declarations: [ViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieViewLayoutModule,
    ImageReferenceModule,
    MovieHeaderModule,
    // Material
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    // Routes
    RouterModule.forChild(routes)
  ]
})
export class MovieViewModule { }
