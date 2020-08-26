import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { MemberPermissionsModule } from '../member-permissions/member-permissions.module';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

// Components
import { MemberRepertoryComponent } from './member-repertory.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    MemberRepertoryComponent,
  ],
  imports: [
    CommonModule,
    TableFilterModule,
    RouterModule,
    MemberPermissionsModule,
    ImageReferenceModule,
    // Material
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
  ],
  exports: [
    MemberRepertoryComponent
  ]
})
export class MemberRepertoryModule { }
