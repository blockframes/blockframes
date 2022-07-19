import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RouterModule, Routes } from "@angular/router";
import { CatalogAvailsShellComponent } from "./shell.component";

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

    //material
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,

    RouterModule.forChild(routes),
  ]
})
export class CatalogAvailsShellModule { }
