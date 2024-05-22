// Angular
import { NgModule } from '@angular/core';
import { ForModule } from '@rx-angular/template/for';
import { IfModule } from '@rx-angular/template/if';

// Blockframes
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Material
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

// Component
import { StateReaderComponent, StateDialogComponent } from './state-reader.component';

@NgModule({
  declarations: [StateReaderComponent, StateDialogComponent],
  imports: [
    BfCommonModule,
    ForModule,
    IfModule,

    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,

    GlobalModalModule,
    MatDialogModule,
  ],
  exports: [StateReaderComponent]
})
export class StateReaderModule { }
