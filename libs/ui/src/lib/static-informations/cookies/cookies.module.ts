// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Pages
import { CookiesComponent } from './cookies.component';
import { CookiesPolicyTextModule } from '@blockframes/auth/components/cookies-policy-text/cookies-policy-text.module';


@NgModule({
  declarations: [CookiesComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    CookiesPolicyTextModule,
    RouterModule.forChild([
      {
        path: '',
        component: CookiesComponent
      }
    ])
  ]
})
export class CookiesModule {}
