import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';

// Components
import { MemberRequestComponent } from './member-request.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    MemberRequestComponent,
  ],
  imports: [
    CommonModule,
    TableFilterModule,

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
