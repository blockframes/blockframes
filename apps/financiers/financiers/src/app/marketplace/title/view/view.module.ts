// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { MarketplaceMovieViewComponent } from './view.component';
import { ContactPartnerModalModule } from '../contact-partner-modal/contact-partner-modal.module';
import { SnackbarErrorModule } from '@blockframes/ui/snackbar/error/snackbar-error.module';

// Custom Modules
import { MovieShellModule } from '@blockframes/movie/marketplace/shell/shell.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { PromotionalLinksModule } from '@blockframes/movie/components/promotional-links/promotional-links.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';
import { CampaignProgressModule } from '@blockframes/campaign/components/progress/progress.module';
// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const routes: Routes = [
  {
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
        loadChildren: () => import('@blockframes/movie/marketplace/main/main.module').then(m => m.MovieMainModule),
        data: { animation: 0 }
      },
      {
        path: 'artistic',
        loadChildren: () => import('@blockframes/movie/marketplace/artistic/artistic.module').then(m => m.MovieArtisticModule),
        data: { animation: 1 }
      },
      {
        path: 'production',
        loadChildren: () => import('@blockframes/movie/marketplace/production/production.module').then(m => m.MovieProductionModule),
        data: { animation: 2 }
      },
      {
        path: 'additional',
        loadChildren: () => import('@blockframes/movie/marketplace/additional/additional.module').then(m => m.MovieAdditionalModule),
        data: { animation: 3 }
      },
      {
        path: 'financing',
        loadChildren: () => import('@blockframes/campaign/marketplace/financing/financing.module').then(m => m.MarketplaceFinancingModule),
        data: { animation: 4 }
      },
      {
        path: 'investment',
        loadChildren: () => import('@blockframes/campaign/marketplace/investment/investment.module').then(m => m.MarketplaceInvestmentModule),
        data: { animation: 5 }
      }
    ]
  }
];

@NgModule({
  declarations: [MarketplaceMovieViewComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MovieShellModule,
    ImageModule,
    MovieHeaderModule,
    OrgChipModule,
    WishlistButtonModule,
    PromotionalLinksModule,
    CampaignProgressModule,
    ContactPartnerModalModule,
    // Material
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    SnackbarErrorModule,
    // Routes
    RouterModule.forChild(routes)
  ]
})
export class MovieViewModule {}