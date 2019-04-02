import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { MovieMaterialsComponent } from './movie-materials/movie-materials.component';
import { DeliveryListComponent } from './delivery-list/delivery-list.component';
import { DeliveryMaterialsComponent } from './delivery-materials/delivery-materials.component';
import { DeliveryFormComponent} from './delivery-form/delivery-form.component';
import { ConfirmComponent } from './delivery-form/confirm.component';
import { NewTemplateComponent } from './delivery-form/new-template.component';
import { TemplatePickerComponent } from './template-picker/template-picker.component';
import { DeliveryGuard } from './delivery.guard';
import { DeliveryViewComponent } from './delivery-view/delivery-view.component';
import { MaterialModule } from '../material/material.module';

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

const routes: Routes = [
  { path: '', component: DeliveryListComponent },
  {
    path: 'movie-materials',
    component: MovieMaterialsComponent
  },
  { path: 'form', component: DeliveryFormComponent },
  { path: 'list', component: DeliveryListComponent },
  { path: 'delivery-materials/:id', canActivate: [DeliveryGuard], component: DeliveryMaterialsComponent },
  { path: 'delivery/:id', canActivate: [DeliveryGuard], component: DeliveryViewComponent },
];

@NgModule({
  declarations: [
    MovieMaterialsComponent,
    DeliveryListComponent,
    DeliveryMaterialsComponent,
    DeliveryFormComponent,
    TemplatePickerComponent,
    NewTemplateComponent,
    ConfirmComponent,
    DeliveryViewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MaterialModule,

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
