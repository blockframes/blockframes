// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LetModule } from '@rx-angular/template/let';
import { RouterModule } from '@angular/router';

// Component
import { MovieTableGridComponent } from './table-grid.component';

// Blockframes
import { MovieCardModule } from '../../components/card/card.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { DisplayNameModule, MaxLengthModule, NumberPipeModule, ToLabelModule } from '@blockframes/utils/pipes';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { TableActionsModule } from '@blockframes/ui/dashboard/components/movie-table-actions/movie-table-actions.module';
import { IncomePipeModule } from '@blockframes/contract/income/pipe';
import { CellModalModule } from '@blockframes/ui/cell-modal/cell-modal.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [MovieTableGridComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LetModule,
    RouterModule,

    // Blockframes
    MovieCardModule,
    TableModule,
    DisplayNameModule,
    MaxLengthModule,
    ToLabelModule,
    TagModule,
    TableActionsModule,
    IncomePipeModule,
    NumberPipeModule,
    CellModalModule,
    ImageModule,
    
    // Material
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule
  ],
  exports: [MovieTableGridComponent]
})
export class MovieTableGridModule { }
