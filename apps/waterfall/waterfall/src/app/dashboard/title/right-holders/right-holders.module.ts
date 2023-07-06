import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { RightHoldersComponent } from './right-holders.component';

// Blockframes
import { RightHolderFormModule } from '@blockframes/waterfall/components/right-holder-form/right-holder-form.module';

// Material

@NgModule({
  declarations: [
    RightHoldersComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RightHolderFormModule,
    
    // Material

    // Routing
    RouterModule.forChild([{ path: '', component: RightHoldersComponent }]),
  ],
})
export class RightHoldersModule { }
