// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { UpdateFundingStatusModalComponent } from './modal.component';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Blockframes
import { OrgAccessModule } from '@blockframes/organization/pipes';

@NgModule({
  declarations: [UpdateFundingStatusModalComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    // Blockframes
    OrgAccessModule,
    GlobalModalModule,
    // Material
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class UpdateFundingStatusModalModule { }
