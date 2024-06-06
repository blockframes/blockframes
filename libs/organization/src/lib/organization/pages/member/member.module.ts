import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

// Modules
import { MemberRepertoryModule } from '../../components/member-repertory/member-repertory.module';
import { MemberPendingModule } from '../../components/member-pending/member-pending.module';
import { MemberRequestModule } from '../../components/member-request/member-request.module';
import { MemberAddModule } from '../../components/member-add/member-add.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';

// Components
import { MemberComponent } from './member.component';

@NgModule({
  declarations: [
    MemberComponent,
  ],
  imports: [
    CommonModule,
    MemberRepertoryModule,
    MemberPendingModule,
    MemberRequestModule,
    MemberAddModule,
    ConfirmModule,
    FlexLayoutModule,
    MatDialogModule,
    RouterModule.forChild([{ path: '', component: MemberComponent }])
  ]
})
export class MemberModule { }
