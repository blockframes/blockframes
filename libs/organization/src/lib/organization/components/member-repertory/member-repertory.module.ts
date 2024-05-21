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
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { RouterModule } from '@angular/router';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
    MatTooltipModule,
  ],
  exports: [
    MemberRepertoryComponent
  ]
})
export class MemberRepertoryModule { }
