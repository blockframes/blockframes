// Angular
import { Component,  ChangeDetectionStrategy, OnDestroy } from '@angular/core';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

// RxJs
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'movie-form-available-materials',
  templateUrl: 'available-materials.component.html',
  styleUrls: ['./available-materials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormAvailableMaterialsComponent implements OnDestroy {

  public form = this.shell.getForm('movie');
  public sub: Subscription;
  public movieId=this.route.snapshot.paramMap.get('movieId')

  constructor(
    private shell: MovieFormShellComponent,
    private dynTitle: DynamicTitleService,
    private route:ActivatedRoute,
  ) {
    this.dynTitle.setPageTitle('Available Materials')
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  get fileForm() {
    return this.form.get('delivery').get('file')
  }
}
