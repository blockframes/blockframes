import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatDividerModule, MatGridListModule } from '@angular/material';

// Componenents
import { MovieDisplayComponent } from './root/root.component';
import { MovieDisplayMainComponent } from './main/main.component';
import { MovieDisplayPromotionalElementsComponent } from './promotional-elements/promotional-elements.component';
import { MovieDisplayPromotionalDescriptionComponent } from './promotional-description/promotional-description.component';
import { MovieDisplayStoryComponent } from './story/story.component';
import { MovieDisplaySalesCastComponent } from './sales-cast/sales-cast.component';

//@todo #643 check css / HTML

@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatGridListModule,
  ],
  declarations: [
    MovieDisplayComponent,
    MovieDisplayMainComponent,
    MovieDisplayPromotionalElementsComponent,
    MovieDisplayPromotionalDescriptionComponent,
    MovieDisplayStoryComponent,
    MovieDisplaySalesCastComponent,
  ],
  exports: [
    MovieDisplayComponent,
  ]
})
export class MovieDisplayModule {}
