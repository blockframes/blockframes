import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { MovieMaterialsComponent } from './movie-materials/movie-materials.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { DeliveryHomeComponent } from './home/home.component';
import { FormComponent } from './form/form.component';
import { ConfirmComponent } from './form/confirm.component';
import { NewTemplateComponent } from './form/new-template.component';
import { TemplatePickerComponent } from './template-picker/template-picker.component';
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
import { MatInputModule, MatMenuModule, MatSidenavModule, MatDialogModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material';
import { CategoryListComponent } from '../template/category-list/category-list.component';
import { MaterialFormComponent } from '../material/material-form/material-form.component';
import { MaterialViewComponent } from '../material/material-view/material-view.component';

export const routes: Routes = [
  { path: '', component: DeliveryHomeComponent },
  {
    path: 'movie-materials',
    component: MovieMaterialsComponent
  },
  { path: 'form', component: FormComponent },
  {
    path: 'list',
    children: [
      { path: '', component: ListComponent },
      { path: ':id', canActivate: [DeliveryGuard], component: ViewComponent },
      { path: '/delivery/:id', canActivate: [DeliveryGuard], component: ViewComponent },
    ]
  }
];

@NgModule({
  declarations: [
    MovieMaterialsComponent,
    ListComponent,
    ViewComponent,
    DeliveryHomeComponent,
    FormComponent,
    CategoryListComponent,
    MaterialFormComponent,
    MaterialViewComponent,
    TemplatePickerComponent,
    NewTemplateComponent,
    ConfirmComponent
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
    MatDialogModule,

    RouterModule.forChild(routes)
  ],
  entryComponents: [TemplatePickerComponent, NewTemplateComponent, ConfirmComponent]
})
export class DeliveryModule {}
