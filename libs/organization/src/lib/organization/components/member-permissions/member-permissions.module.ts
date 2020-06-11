import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MemberPermissionsComponent } from './member-permissions.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    MemberPermissionsComponent,
  ],
  imports: [
    CommonModule,

    // Material
    MatButtonModule,
    MatIconModule,

    MatMenuModule,
  ],
  exports: [
    MemberPermissionsComponent
  ]
})
export class MemberPermissionsModule { }
