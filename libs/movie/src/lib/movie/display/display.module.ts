import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';

// Componenents
import { MovieDisplayComponent } from './root/root.component';
import { MovieDisplayMainComponent } from './main/main.component';
import { MovieDisplayPromotionalElementsComponent } from './promotional-elements/promotional-elements.component';
import { MovieDisplayPromotionalDescriptionComponent } from './promotional-description/promotional-description.component';
import { MovieDisplayStoryComponent } from './story/story.component';
import { MovieDisplaySalesCastComponent } from './sales-cast/sales-cast.component';
import { MovieDisplaySalesInfoComponent } from './sales-info/sales-info.component';
import { MovieDisplayVersionInfoComponent } from './version-info/version-info.component';
import { MovieDisplayFestivalPrizesComponent } from './festival-prizes/festival-prizes.component';
import { MovieDisplaySalesAgentDealComponent } from './sales-agent-deal/sales-agent-deal.component';

@NgModule({
  imports: [CommonModule, TranslateSlugModule, ImageReferenceModule, MatCardModule, MatDividerModule, MatGridListModule, MatListModule],
  declarations: [
    MovieDisplayComponent,
    MovieDisplayMainComponent,
    MovieDisplayPromotionalElementsComponent,
    MovieDisplayPromotionalDescriptionComponent,
    MovieDisplayStoryComponent,
    MovieDisplaySalesCastComponent,
    MovieDisplaySalesInfoComponent,
    MovieDisplayVersionInfoComponent,
    MovieDisplayFestivalPrizesComponent,
    MovieDisplaySalesAgentDealComponent,
  ],
  exports: [MovieDisplayComponent]
})
export class MovieDisplayModule {}
