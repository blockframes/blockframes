// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { firebase } from '@env';
// Angular Fire
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule} from '@angular/material/menu';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

// Libraries
import { UploadModule, UiFormModule } from '@blockframes/ui';
import { StakeholderModule } from '../stakeholder/stakeholder.module';

// Components
import { HomeComponent } from './home/home.component';
import { ContainerComponent } from './form/container.component';
import { FormComponent } from './form/form.component';
import { FormMainComponent } from './form/form.main.component';
import { FormStoryComponent } from './form/form.story.component'
import { FormTeamComponent } from './form/form.team.component';
import { FormPromotionalComponent } from './form/form.promotional.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';

import { MovieRoutingModule } from './movie-routing.module';
import { AngularFireModule } from '@angular/fire';
import { TitleFormComponent } from '../movie/title-form/title-form.component';
import { MatTabsModule, MatGridListModule, MatExpansionModule, MatProgressSpinnerModule } from '@angular/material';
import { HomeEmptyComponent } from './home-empty/home-empty.component';
import { DelayedWrapperComponent } from './delayed-wrapper/delayed-wrapper.component';


@NgModule({
  declarations: [
    HomeComponent,
    ContainerComponent,
    FormComponent,
    FormStoryComponent,
    ListComponent,
    ViewComponent,
    TitleFormComponent,
    FormMainComponent,
    FormTeamComponent,
    FormPromotionalComponent,
    HomeEmptyComponent,
    DelayedWrapperComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MovieRoutingModule,
    // Angular Fire
    AngularFireModule.initializeApp(firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    // Material
    MatSnackBarModule,
    MatCardModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatCheckboxModule,
    MatMenuModule,
    MatTabsModule,
    MatGridListModule,
    MatExpansionModule,
    NgxMatSelectSearchModule,
    MatProgressSpinnerModule,
    // Librairies
    UploadModule,
    UiFormModule,
    StakeholderModule,
  ],
  providers: [
    { provide: FirestoreSettingsToken, useValue: {} },// TODO: Remove when @angular/fire is updated
  ],
  entryComponents: [TitleFormComponent],
  exports: [TitleFormComponent],
})
export class MovieModule {}
