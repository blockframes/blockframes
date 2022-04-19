import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';

// Modules
import { MemberPermissionsModule } from '../member-permissions/member-permissions.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';

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
    TableModule,
    RouterModule,
    MemberPermissionsModule,
    ImageModule,
    ClipboardModule,
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
