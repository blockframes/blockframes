import { NgModule } from '@angular/core';
import { OffersListComponent } from './offer-list.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Blockframes
import { OfferListModule } from '@blockframes/contract/offer/list/list.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
