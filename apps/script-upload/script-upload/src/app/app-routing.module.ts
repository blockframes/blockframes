import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component
import { FormComponent } from './form/form.component';
import { HomeComponent } from './home/home.component';

// Guard
import { AuthGuard } from '@blockframes/auth';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'form',
    component: FormComponent,
    canActivate: [AuthGuard],
    data: { fallback: '' }
  }
]

@NgModule({
  imports : [RouterModule.forRoot(routes)],
  exports : [RouterModule]
})
export class AppRoutingModule {}
