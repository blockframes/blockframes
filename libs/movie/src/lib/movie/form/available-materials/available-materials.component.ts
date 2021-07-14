// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';

// Blockframes
import { createMovieLanguageSpecification } from '@blockframes/movie/+state';
import { VersionSpecificationForm } from '@blockframes/movie/form/movie.form';
import { Language } from '@blockframes/utils/static-model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

// RxJs
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'movie-form-available-materials',
  templateUrl: 'available-materials.component.html',
  styleUrls: ['./available-materials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormAvailableMaterialsComponent implements OnDestroy {

  public form = this.shell.getForm('movie');
  private sub: Subscription;

  constructor(private shell: MovieFormShellComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Available Materials')
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
