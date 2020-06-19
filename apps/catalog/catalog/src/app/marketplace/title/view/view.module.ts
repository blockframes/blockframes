// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { MarketplaceMovieViewComponent } from './view.component';

// Custom Modules
import { ImgModule } from '@blockframes/ui/media/img/img.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const routes = [{
  path: '',
  component: MarketplaceMovieViewComponent,
  children: [
    {
      path: '',
      redirectTo: 'main',
      pathMatch: 'full'
    },
    {
      path: 'main',
      loadChildren: () => import('../main/main.module').then(m => m.MarketplaceMovieMainModule)
    },
    {
      path: 'avails',
      loadChildren: () => import('../avails/avails.module').then(m => m.MarketplaceMovieAvailsModule)
    }
  ]
}];

@NgModule({
  declarations: [MarketplaceMovieViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Custom Modules
    ImgModule,
    WishlistButtonModule,
    // Material
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    // Routes
    RouterModule.forChild(routes)
  ]
})
export class MovieViewModule {}
