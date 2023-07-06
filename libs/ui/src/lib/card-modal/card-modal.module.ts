
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { CardModalComponent } from './card-modal.component';

// Material
import { MatButtonModule } from '@angular/material/button';


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