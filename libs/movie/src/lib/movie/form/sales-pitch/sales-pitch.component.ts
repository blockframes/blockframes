import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { ActivatedRoute } from '@angular/router';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'movie-form-sales-pitch',
  templateUrl: './sales-pitch.component.html',
  styleUrls: ['./sales-pitch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormSalesPitchComponent {
  form = this.shell.getForm('movie');

  constructor(
    private shell: MovieFormShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
  ) {
    this.dynTitle.setPageTitle('Sales Pitch')
  }

  get salesPitch() {
    return this.form.promotional.get('salesPitch');
  }

  public getPath() {
    const { movieId } = this.route.snapshot.params;
    return `movies/${movieId}/promotional.salesPitch/`;
  }

}
