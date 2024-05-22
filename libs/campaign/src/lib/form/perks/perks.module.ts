import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TunnelPageModule } from '@blockframes/ui/tunnel';

import { CampaignFormPerksComponent } from './perks.component';
import { PerksPipeModule } from '../../pipes/perks.pipe';

import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [CampaignFormPerksComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    TunnelPageModule,
    PerksPipeModule,
    FormTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: CampaignFormPerksComponent }])
  ]
})
export class CampaignFormPerksModule { }
