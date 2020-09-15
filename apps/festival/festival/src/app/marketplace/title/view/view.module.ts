// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { MarketplaceMovieViewComponent } from './view.component';
import { MovieShellModule } from '@blockframes/movie/marketplace/shell/shell.module';

@NgModule({
  declarations: [MarketplaceMovieViewComponent],
  imports: [
    CommonModule,
    MovieShellModule,
  ]
})
export class MovieViewModule {}
