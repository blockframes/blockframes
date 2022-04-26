// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { MarketplaceMovieModalComponent } from './modal.component';
import { SnackbarErrorModule } from '@blockframes/ui/snackbar/error/snackbar-error.module';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [MarketplaceMovieModalComponent],
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
    GlobalModalModule,
    // Material
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    SnackbarErrorModule
  ]
})
export class MarketplaceMovieModalModule {}