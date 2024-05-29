
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { CardModalComponent } from './card-modal.component';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';


@NgModule({
  declarations: [ CardModalComponent ],
  imports: [
    CommonModule,

    // Material
    MatButtonModule,
  ],
  exports: [ CardModalComponent ],
})
export class CardModalModule {}