import { NgModule } from '@angular/core';
import { OrganizationComponent } from './organization.component';
import { AsideModule } from './../marketplace/layout/aside/aside.module';
import { AnonymousLayoutModule } from '@blockframes/ui/layout/anonymous/anonymous.module';
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
    canActivate: [OrganizationAuthGuard],
    canDeactivate: [OrganizationAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'i',
        pathMatch: 'full'
      },
      {
        path: 'email',
        canActivate: [NoOrganizationAuthGuard],
        loadChildren: () => import('./email/email.module').then(m => m.EmailModule),

      },
      {
        path: 'login',
        canActivate: [NoOrganizationAuthGuard],
        loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
      },
      {
        path: 'i',
        canActivate: [IdentityGuard],
        component: OrganizationComponent,
        children: [
          {
            path: '',
            loadChildren: () => import('../marketplace/organization/view/view.module').then(m => m.OrganizationViewModule),
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
    AnonymousLayoutModule,
    AsideModule,
    ImageModule
  ]
})
export class OrganizationModule { }
