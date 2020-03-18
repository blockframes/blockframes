// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { ViewComponent } from './view.component';

// Custom Modules
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const routes = [{
  path: '',
  component: ViewComponent,
  children: [{
    path: '',
    loadChildren: () => import('../main/main.module').then(m => m.MovieMainModule)
  }]
}];

@NgModule({
  declarations: [ViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,
    // Material
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    // Routes
    RouterModule.forChild(routes)
  ]
})
export class MovieViewModule { }
