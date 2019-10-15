// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { firebase } from '@env';

// Angular Fire
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireModule } from '@angular/fire';

// Modules
import { MovieRoutingModule } from './movie-routing.module';
import { MovieFormModule } from './form/form.module';
import { UploadModule, UiFormModule, MovieCardModule } from '@blockframes/ui';
import { MovieDisplayModule } from './display/display.module';

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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

// Pages
import { MovieEditableComponent } from './pages/movie-editable/movie-editable.component';
import { MovieCreateComponent } from './pages/movie-create/movie-create.component';
import { MovieViewComponent } from './pages/movie-view/movie-view.component';

// Components
import { MovieTitleFormComponent } from './components/movie-title-form/movie-title-form.component';
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { MovieEmptyComponent } from './components/movie-empty/movie-empty.component';
import { MoviePickerComponent } from './components/movie-picker/movie-picker.component';
import { MovieImdbSearchModule } from './components/movie-imdb-search/movie-imdb-search.module';

@NgModule({
  declarations: [
    MovieEditableComponent,
    MovieTitleFormComponent,
    MovieEmptyComponent,
    MovieCreateComponent,
    MovieViewComponent,
    MoviePickerComponent,
    MovieListComponent
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
    MovieDisplayModule,
    MovieFormModule,
    MovieCardModule,
    MovieImdbSearchModule,
  ],
  providers: [
    { provide: FirestoreSettingsToken, useValue: {} },// TODO: Remove when @angular/fire is updated
  ],
  entryComponents: [MovieTitleFormComponent],
  exports: [MovieTitleFormComponent, MoviePickerComponent, MovieListComponent],
})
export class MovieModule {}
