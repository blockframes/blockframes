
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';

import { WaterfallRightListComponent } from './right-list.component';
import { WaterfallPoolModalModule } from '../pool-modal/pool-modal.module';


@NgModule({
  declarations: [ WaterfallRightListComponent ],
  imports: [
    ReactiveFormsModule,
    CommonModule,

    WaterfallPoolModalModule,

    MatIconModule,
    MatChipsModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatFormFieldModule,
  ],
  exports: [ WaterfallRightListComponent ],
})
export class WaterfallRightListModule {}
