import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Component
import { FormComponent } from './form/form.component';
import { HomeComponent } from './home/home.component';
// Guard
import { AuthGuard } from '@blockframes/auth';
import { IpResolver } from '@blockframes/ip';
import { organizationRoutes } from '@blockframes/organization';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'form/:id',
    component: FormComponent,
    canActivate: [AuthGuard],
    data: { fallback: '' },
    resolve: {
      ip: IpResolver
    }
  },
  {
    path: 'form',
    component: FormComponent,
    canActivate: [AuthGuard],
    data: { fallback: '', ip: null }
  },
  {
    path: 'organization',
    children: organizationRoutes
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
