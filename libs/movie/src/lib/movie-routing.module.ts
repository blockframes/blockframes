import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { FormComponent } from './form/form.component';
import { HomeComponent } from './home/home.component';
import { ViewComponent } from './view/view.component';

// Guards
import { MovieGuard } from './guards/movie.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },

  // MovieGuard: set active the Movie id in Akita

  {
    path: 'form',
    component: FormComponent,
  },
  {
    path: 'form/:id',
    component: FormComponent,
    canActivate: [MovieGuard],
  },
  {
    path: 'movie/:id',
    component: ViewComponent,
    canActivate: [MovieGuard],
  },
]

@NgModule({
  imports : [RouterModule.forChild(routes)],
  exports : [RouterModule]
})
export class MovieRoutingModule { }
