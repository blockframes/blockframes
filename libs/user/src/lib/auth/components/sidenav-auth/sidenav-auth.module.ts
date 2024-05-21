import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SidenavAuthComponent } from './sidenav-auth.component';

// Material
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  declarations: [SidenavAuthComponent],
  exports: [SidenavAuthComponent]
})
export class SidenavAuthModule {}