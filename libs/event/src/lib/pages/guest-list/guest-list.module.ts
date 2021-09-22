import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuestListComponent } from './guest-list.component';
import { EventFromShellModule } from '@blockframes/event/form/shell/shell.module';

// Material
import { GuestListModule as GuestListComponentModule } from '@blockframes/invitation/components/guest-list/guest-list.module';

@NgModule({
  declarations: [GuestListComponent],
  imports: [
    CommonModule,
    EventFromShellModule,
    GuestListComponentModule,
  ]
})
export class GuestListModule { }
