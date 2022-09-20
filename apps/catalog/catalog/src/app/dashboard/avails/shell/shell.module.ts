import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component
import { CatalogAvailsShellComponent } from './shell.component';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
  {
    path: '',
    component: CatalogAvailsShellComponent,
    children: [
      {
        redirectTo: 'map',
        pathMatch: 'full',
        path: '',
      },
      {
        path: 'map',
        loadChildren: () => import('../map/map.module').then(m => m.CatalogDashboardAvailsMapModule)
      },
      {
        path: 'calendar',
        loadChildren: () => import('../calendar/calendar.module').then(m => m.CatalogDashboardAvailsCalendarModule)
      },
    ],
  },
]

@NgModule({
  declarations: [
    CatalogAvailsShellComponent,
  ],
  imports: [
    CommonModule,
    LogoSpinnerModule,

    //material
    MatButtonModule,
    MatIconModule,
    MatCardModule,

    RouterModule.forChild(routes),
  ]
})
export class CatalogAvailsShellModule { }
