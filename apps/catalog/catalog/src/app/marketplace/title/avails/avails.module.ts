
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';


// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';


import { ToLabelModule } from '@blockframes/utils/pipes';
import { LanguagesFormModule } from '@blockframes/movie/form/languages/languages.module';

import { AvailsGuard } from './avails.guard';
import { MarketplaceMovieAvailsComponent } from './avails.component';
import { ExplanationModule } from './explanation/explanation.module';


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

    RouterModule.forChild(routes)
  ]
})
export class MarketplaceMovieAvailsModule { }
