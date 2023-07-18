import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { JoinPipeModule, ToGroupLabelPipeModule, ToLabelModule } from '@blockframes/utils/pipes';
import { GroupMultiselectComponent } from './group.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
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
  ],
  declarations: [GroupMultiselectComponent],
  exports: [GroupMultiselectComponent],
})
export class GroupMultiselectModule {}
