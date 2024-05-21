import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { JoinPipeModule, ToGroupLabelPipeModule, ToLabelModule } from '@blockframes/utils/pipes';
import { GroupMultiselectComponent } from './group.component';
import { DetailedGroupModule } from '../../detail-modal/detailed.module';

// Material
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTooltipModule,
    ToLabelModule,
    ToGroupLabelPipeModule,
    JoinPipeModule,
    DetailedGroupModule
  ],
  declarations: [GroupMultiselectComponent],
  exports: [GroupMultiselectComponent],
})
export class GroupMultiselectModule {}
