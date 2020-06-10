import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MemberPermissionsComponent } from './member-permissions.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Material
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';

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
    MatListModule,

  ],
  exports: [
    MemberPermissionsComponent
  ]
})
export class MemberPermissionsModule { }
