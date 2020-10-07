import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { TunnelPageModule } from '@blockframes/ui/tunnel';

import { CampaignFormPerksComponent } from './perks.component';

import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [CampaignFormPerksComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    FormTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: CampaignFormPerksComponent }])
  ]
})
export class PerksModule { }
