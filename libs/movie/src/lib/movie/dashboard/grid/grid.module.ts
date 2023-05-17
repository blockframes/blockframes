// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LetModule } from '@rx-angular/template/let';

// Component
import { GridTableDirective, MovieGridComponent } from './grid.component';

// Blockframes
import { MovieCardModule } from "@blockframes/movie/components/card/card.module";

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [MovieGridComponent, GridTableDirective],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LetModule,

    // Blockframes
    MovieCardModule,

    // Material
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule
  ],
  exports: [MovieGridComponent, GridTableDirective]
})
export class MovieGridModule { }
