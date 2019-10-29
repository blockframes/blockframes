// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { firebase } from '@env';

// Angular Fire
import { AngularFirestoreModule } from '@angular/fire/firestore';
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
import { UploadModule, UiFormModule, MovieCardModule } from '@blockframes/ui';
import { MovieDisplayModule } from './display/display.module';

// Components
import { MovieEditableComponent } from './pages/movie-editable/movie-editable.component';
import { MovieListComponent } from './pages/movie-list/movie-list.component';
import { MovieEmptyComponent } from './components/movie-empty/movie-empty.component';
import { MovieRoutingModule } from './movie-routing.module';
import { MovieTitleFormComponent } from './components/movie-title-form/movie-title-form.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { HomeEmptyComponent } from './components/home-empty/home-empty.component';
import { MovieCreateComponent } from './pages/movie-create/movie-create.component';
import { MovieViewComponent } from './pages/movie-view/movie-view.component';
import { MovieFormModule } from './form/form.module';

// Component Module
import { MovieImdbSearchModule } from './components/movie-imdb-search/movie-imdb-search.module';
import { MoviePickerModule } from './components/movie-picker/movie-picker.module';

@NgModule({
  declarations: [
    MovieEditableComponent,
    MovieListComponent,
    MovieTitleFormComponent,
    HomeEmptyComponent,
    MovieEmptyComponent,
    MovieCreateComponent,
    MovieViewComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MovieRoutingModule,
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
    // Component Module
    MoviePickerModule
  ],
  entryComponents: [MovieTitleFormComponent],
})
export class MovieModule {}
