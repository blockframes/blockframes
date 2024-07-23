import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components
import { ProfileCookieComponent } from './profile-cookie.component';

// Modules
import { CookieFormModule } from '@blockframes/utils/gdpr-cookie/cookie-form/cookie-form.module';
import { CookiesPolicyModule } from '@blockframes/auth/components/cookies-policy/cookies-policy.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,
    CookiesPolicyModule,
    CookieFormModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    RouterModule.forChild([{ path: '', component: ProfileCookieComponent }])
  ],
  declarations: [ProfileCookieComponent],
})
export class ProfileCookieModule { }
