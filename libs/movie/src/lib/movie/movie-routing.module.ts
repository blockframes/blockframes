import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { MovieEditableComponent } from './pages/movie-editable/movie-editable.component';
import { MovieViewComponent } from './pages/movie-view/movie-view.component';

export const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  { path: 'view', component: MovieViewComponent },
  { path: 'edit', component: MovieEditableComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovieRoutingModule {}
