import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { RequestAskingPriceComponent } from './request-asking-price.component';

// Blockframes
import { StaticGroupModule } from '@blockframes/ui/static-autocomplete/group/group.module';
import { GlobalModalModule } from "@blockframes/ui/global-modal/global-modal.module";

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    // Blockframes
    StaticGroupModule,
    GlobalModalModule,
    // Material
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
  ],
  declarations: [RequestAskingPriceComponent]
})
export class RequestAskingPriceModule { }