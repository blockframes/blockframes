import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
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
        path: 'map',
        loadChildren: () => import('../map/map.module').then(m => m.CatalogDashboardAvailsMapModule)
      },
      {
        redirectTo: 'map',
        pathMatch: 'full',
        path: '',
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
    FlexLayoutModule,
    RouterModule.forChild(routes),

    //material
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ]
})
export class CatalogAvailsShellModule { }
