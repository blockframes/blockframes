import { NgModule } from '@angular/core';
import { OrganizationComponent } from './organization.component';
import { AsideModule } from './../marketplace/layout/aside/aside.module';
import { EventLayoutModule } from '@blockframes/ui/layout/event/event.module';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Routes
import { RouterModule, Routes } from '@angular/router';

// Guards
import { IdentityGuard } from '@blockframes/organization/guard/identity.guard';
import { OrganizationAuthGuard } from '@blockframes/organization/guard/organization-auth.guard';
import { NoOrganizationAuthGuard } from '@blockframes/organization/guard/no-organization-auth.guard';

const routes: Routes = [
  {
    path: ':orgId',
    canActivate: [OrganizationAuthGuard], // TODO #9124 check guards
    canDeactivate: [OrganizationAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'i',
        pathMatch: 'full'
      },
      {
        path: 'email',
        canActivate: [],
        loadChildren: () => import('./email/email.module').then(m => m.EmailModule),

      },
      {
        path: 'login',
        canActivate: [NoOrganizationAuthGuard], // TODO #9124 check guards
        loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
      },
      {
        path: 'i',
        canActivate: [IdentityGuard], // TODO #9124 check guards
        component: OrganizationComponent,
        children: [
          {
            path: '',
            loadChildren: () => import('./view/view.module').then(m => m.OrganizationViewModule),
          }
        ]
      }
    ]
  },
  {
    path: '**',
    loadChildren: () => import('@blockframes/ui/error/error-not-found.module').then(m => m.ErrorNotFoundModule)
  }
];

@NgModule({
  declarations: [OrganizationComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FlexLayoutModule,
    EventLayoutModule,
    AsideModule,
    ImageModule
  ]
})
export class OrganizationModule { }
