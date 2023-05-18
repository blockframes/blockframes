// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LetModule } from '@rx-angular/template/let';
import { RouterModule } from '@angular/router';

// Component
import { MovieGridComponent } from './grid.component';

// Blockframes
import { MovieCardModule } from '../../components/card/card.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { DisplayNameModule, MaxLengthModule, NumberPipeModule, ToLabelModule } from '@blockframes/utils/pipes';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { TableActionsModule } from '@blockframes/ui/dashboard/components/movie-table-actions/movie-table-actions.module';
import { IncomePipeModule } from '@blockframes/contract/income/pipe';
import { CellModalModule } from '@blockframes/ui/cell-modal/cell-modal.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [MovieGridComponent],
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
    
    // Material
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule
  ],
  exports: [MovieGridComponent]
})
export class MovieGridModule { }
