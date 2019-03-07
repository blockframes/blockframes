import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Component
import { FormComponent } from './form/form.component';
import { HomeComponent } from './home/home.component';
import { OrgFormComponent, OrgListComponent, OrgShowComponent } from '@blockframes/organization';
// Guard
import { AuthGuard } from '@blockframes/auth';
import { IpResolver } from '@blockframes/ip';

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
    path: 'organization/_new',
    component: OrgFormComponent,
    canActivate: [AuthGuard],
    data: { fallback: '', org: null }
  },
  {
    path: 'organization/_list',
    component: OrgListComponent,
    canActivate: [AuthGuard],
    data: { fallback: '' }
  },
  {
    path: 'organization/:id',
    component: OrgShowComponent,
    canActivate: [AuthGuard],
    data: { fallback: '' }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
