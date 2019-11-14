import { MovieCardComponent } from './movie-card.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { CropperModule } from '@blockframes/ui/cropper/cropper.module';


@NgModule({
  imports: [CommonModule, CropperModule, MatCardModule, MatIconModule, MatMenuModule, RouterModule, MatButtonModule, MatDividerModule, MatChipsModule, TranslateSlugModule],
  declarations: [MovieCardComponent],
  exports: [MovieCardComponent]
})
export class MovieCardModule {}
