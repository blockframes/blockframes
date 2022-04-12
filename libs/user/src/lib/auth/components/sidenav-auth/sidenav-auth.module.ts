import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SidenavAuthComponent } from './sidenav-auth.component';

// Material
import { MatListModule } from '@angular/material/list';
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