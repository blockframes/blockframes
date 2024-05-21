import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Components
import { ProfileViewComponent } from './profile-view.component';

// Material
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [{
  path: '',
  component: ProfileViewComponent,
  children: [
    {
      path: '',
      redirectTo: 'settings',
      pathMatch: 'full'
    },
    {
      path: 'settings',
      loadChildren: () => import('../profile/profile.module').then(m => m.ProfileModule)
    },
    {
      path: 'cookies',
      loadChildren: () => import('../profile-cookie/profile-cookie.module').then(m => m.ProfileCookieModule)
    },
    {
      path: 'notifications',
      loadChildren: () => import('../../forms/notifications-form/notifications-form.module').then(m => m.NotificationsFormModule)
    },
    {
      path: 'preferences',
      loadChildren: () => import('../preferences/page/preferences.module').then(m => m.PreferenceModule)
    }
  ]
}]

@NgModule({
  declarations: [ProfileViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageModule,
    // Material
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    RouterModule.forChild(routes)
  ]
})
export class ProfileViewModule { }
