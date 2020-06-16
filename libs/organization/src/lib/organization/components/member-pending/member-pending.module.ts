import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { MemberPendingComponent } from './member-pending.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

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
