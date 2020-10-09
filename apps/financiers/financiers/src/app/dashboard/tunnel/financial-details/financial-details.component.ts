import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';


@Component({
  selector: 'financiers-form-financial-details',
  templateUrl: './financial-details.component.html',
  styleUrls: ['./financial-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormFinancialDetailsComponent {
  form = this.shell.getForm('movie');

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute) { }

  get totalBudget() {
    return this.form.get('totalBudget');
  }

  public getPath() {
    const { movieId } = this.route.snapshot.params;
    return `movies/${movieId}/promotional.financialDetails/`;
  }
}
