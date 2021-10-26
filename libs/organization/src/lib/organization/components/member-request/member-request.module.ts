import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules

// Components
import { MemberRequestComponent } from './member-request.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TableModule } from '@blockframes/ui/list/table/table.module';

@NgModule({
  declarations: [
    MemberRequestComponent,
  ],
  imports: [
    CommonModule,
    TableModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  exports: [
    MemberRequestComponent
  ]
})
export class MemberRequestModule { }
