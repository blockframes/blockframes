import { NgModule } from '@angular/core';
import { OffersListComponent } from './offer-list.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Blockframes
import { OfferListModule } from '@blockframes/contract/offer/list/list.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

@NgModule({
  declarations: [
    OffersListComponent,
  ],
  imports: [
    CommonModule,
    OfferListModule,
    // Material
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    // Router
    RouterModule.forChild([{ path: '', component: OffersListComponent }])
  ],
})
export class CrmOfferListModule { }
