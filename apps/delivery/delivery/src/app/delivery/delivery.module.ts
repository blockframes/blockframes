import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MovieMaterialsComponent } from './movie-materials/movie-materials.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { HomeComponent } from './home/home.component';
import { FormComponent } from './form/form.component';
import { CategoryListComponent } from '../template/category-list/category-list.component';
import { MaterialFormComponent } from '../material/material-form/material-form.component';
import { DeliveryGuard } from './delivery.guard';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule, MatMenuModule, MatSidenavModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material';
import { MaterialViewComponent } from '../material/material-view/material-view.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'movie-materials',
    component: MovieMaterialsComponent
  },
  { path: 'form', component: FormComponent },
  {
    path: 'list',
    children: [
      { path: '', component: ListComponent },
      { path: ':id', canActivate: [DeliveryGuard], component: ViewComponent }
    ]
  }
];

@NgModule({
  declarations: [
    MovieMaterialsComponent,
    ListComponent,
    ViewComponent,
    HomeComponent,
    FormComponent,
    CategoryListComponent,
    MaterialFormComponent,
    MaterialViewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,

    // Material
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatInputModule,
    MatMenuModule,
    MatSidenavModule,
    MatFormFieldModule,

    RouterModule.forChild(routes)
  ],
})
export class DeliveryModule {}
