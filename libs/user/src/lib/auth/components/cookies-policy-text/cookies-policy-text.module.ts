// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Component
import { CookiesPolicyTextComponent } from './cookies-policy-text.component';

// Material
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [CookiesPolicyTextComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  exports: [CookiesPolicyTextComponent]
})
export class CookiesPolicyTextModule { }
