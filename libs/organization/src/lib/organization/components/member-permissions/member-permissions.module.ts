import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MemberPermissionsComponent } from './member-permissions.component';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';

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
