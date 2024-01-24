
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components
import { RightHoldersComponent } from './right-holders.component';

// Blockframes
import { RightholderTableModule } from '@blockframes/waterfall/components/rightholder-table/rightholder-table.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    RightHoldersComponent,
  ],
  imports: [
    CommonModule,
    RightholderTableModule,
    
    // Material
    MatIconModule,
    MatButtonModule,

    // Routing
    RouterModule.forChild([{ path: '', component: RightHoldersComponent }]),
  ],
})
export class RightHoldersModule { }
