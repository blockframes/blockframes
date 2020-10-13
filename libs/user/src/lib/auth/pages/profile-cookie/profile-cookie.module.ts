import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { ProfileCookieComponent } from './profile-cookie.component';

// Modules
import { CookieFormModule } from '@blockframes/utils/gdpr-cookie/cookie-form/cookie-form.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    CookieFormModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: ProfileCookieComponent }])
  ],
  declarations: [ProfileCookieComponent],
})
export class ProfileCookieModule { }
