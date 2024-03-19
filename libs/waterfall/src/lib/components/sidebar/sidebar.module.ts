
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { BfCommonModule } from '@blockframes/utils/bf-common.module';

import { WaterfallSidebarComponent } from './sidebar.component';


@NgModule({
  declarations: [ WaterfallSidebarComponent ],
  imports: [
    BfCommonModule,
    ReactiveFormsModule,


    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatButtonToggleModule,
  ],
  exports: [ WaterfallSidebarComponent ],
})
export class WaterfallSidebarModule {}
