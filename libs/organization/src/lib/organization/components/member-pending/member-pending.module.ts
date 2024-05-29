import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { MemberPendingComponent } from './member-pending.component';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';

@NgModule({
  declarations: [
    MemberPendingComponent,
  ],
  imports: [
    CommonModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
  ],
  exports: [
    MemberPendingComponent
  ]
})
export class MemberPendingModule { }
