import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components
import { RightHoldersManagementComponent } from './right-holders-management.component';

// Blockframes
import { RightHolderFormModule } from '@blockframes/waterfall/components/rightholder/rightholder-form/rightholder-form.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

@NgModule({
  declarations: [
    RightHoldersManagementComponent,
  ],
  imports: [
    CommonModule,

    RightHolderFormModule,
    
    // Material
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,

    // Routing
    RouterModule.forChild([{ path: '', component: RightHoldersManagementComponent }]),
  ],
})
export class RightHoldersManagementModule { }
