// Angular
import { NgModule } from '@angular/core';
import { ForModule } from '@rx-angular/template/for';
import { IfModule } from '@rx-angular/template/if';

// Blockframes
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Material
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';

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
