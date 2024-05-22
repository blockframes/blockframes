import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { LanguagesFormModule } from '@blockframes/movie/form/languages/languages.module';
import { SnackbarErrorModule } from '@blockframes/ui/snackbar/error/snackbar-error.module';

import { AvailsGuard } from './avails.guard';
import { MarketplaceMovieAvailsComponent } from './avails.component';
import { ExplanationModule } from './explanation/explanation.module';
import { ReverseModule } from '@blockframes/utils/pipes/reverse.pipe';
import { ToGroupLabelPipeModule } from '@blockframes/utils/pipes/group-label.pipe';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';
import { HoldbackModalModule } from '@blockframes/contract/contract/holdback/modal/holdback-modal.module';
import { CollidingHoldbacksPipeModule } from '@blockframes/contract/contract/holdback/pipes/colliding-holdback.pipe'

const routes: Routes = [
  {
    path: '',
    component: MarketplaceMovieAvailsComponent,
    canDeactivate: [AvailsGuard],
    children: [
      { path: '', redirectTo: 'map', pathMatch: 'full' },
      {
        path: 'map',
        loadChildren: () => import('./map/avails-map.module').then(m => m.MarketplaceMovieAvailsMapModule),
      },
      {
        path: 'calendar',
        loadChildren: () => import('./calendar/avails-calendar.module').then(m => m.MarketplaceMovieAvailsCalendarModule),
      },
    ],
  },
];

@NgModule({
  declarations: [MarketplaceMovieAvailsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    ToLabelModule,
    LanguagesFormModule,
    ExplanationModule,
    ReverseModule,
    ConfirmModule,
    ToGroupLabelPipeModule,
    HoldbackModalModule,
    CollidingHoldbacksPipeModule,

    // Material
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    SnackbarErrorModule,

    RouterModule.forChild(routes)
  ]
})
export class MarketplaceMovieAvailsModule { }
