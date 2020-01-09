// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

// Modules
import { EditableModule, EditableSidenavModule } from '@blockframes/ui';
import { ConfirmModule } from '@blockframes/ui';
import { MaterialModule } from '../material/material.module';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';

// Components
import { TemplateAddComponent } from './components/template-add/template-add.component';
import { TemplateMaterialListComponent } from './components/template-material-list/template-material-list.component';
import { TemplateMaterialFormComponent } from './components/template-material-form/template-material-form.component';
import { TemplateRepertoryComponent } from './components/template-repertory/template-repertory.component';

// Pages
import { TemplateEditableComponent } from './pages/template-editable/template-editable.component';
import { TemplateListComponent } from './pages/template-list/template-list.component';
import { TemplateCreateComponent } from './pages/template-create/template-create.component';

// Guards
import { TemplateActiveGuard } from './guards/template-active.guard';
import { TemplateListGuard } from './guards/template-list.guard';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { TemplateMaterialsGuard } from '../material/guards/template-materials.guard';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'create',
    component: TemplateCreateComponent
  },
  {
    path: 'list',
    component: TemplateListComponent,
    canActivate: [TemplateListGuard],
    canDeactivate: [TemplateListGuard]
  },
  {
    path: ':templateId',
    canActivate: [TemplateActiveGuard],
    canDeactivate: [TemplateActiveGuard],
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        canActivate: [TemplateMaterialsGuard],
        canDeactivate: [TemplateMaterialsGuard],
        component: TemplateEditableComponent,
      },
    ]
  }
]

@NgModule({
  declarations: [
    TemplateEditableComponent,
    TemplateListComponent,
    TemplateAddComponent,
    TemplateCreateComponent,
    TemplateMaterialListComponent,
    TemplateMaterialFormComponent,
    TemplateRepertoryComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    MatIconModule,
    MatSidenavModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatButtonModule,
    MatMenuModule,
    MatExpansionModule,
    MaterialModule,
    ConfirmModule,
    EditableModule,
    EditableSidenavModule,
    MatTableModule,
    MatSelectModule,
    MatSortModule,
    RouterModule.forChild(routes),
    ImgAssetModule
  ],
  entryComponents: [TemplateAddComponent]
})
export class TemplateModule {}
