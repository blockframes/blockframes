import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';

// Components
import { ProfileViewComponent } from './profile-view.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
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
      path: 'notifications',
      loadChildren: () => import('../notifications-settings/notifications-settings.module').then(m => m.NotificationSettingsModule)
    },
    {
      path: 'cookies',
      loadChildren: () => import('../profile-cookie/profile-cookie.module').then(m => m.ProfileCookieModule)
    },
    {
      path: 'notifications',
      loadChildren: () => import('../notifications/notifications.module').then(m => m.NotificationsModule)
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
    MatProgressSpinnerModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    OrgNameModule,
    MatTabsModule,
    RouterModule.forChild(routes)
  ]
})
export class ProfileViewModule { }
