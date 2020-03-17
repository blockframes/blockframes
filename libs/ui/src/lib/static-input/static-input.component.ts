// Angular
import { FormControl } from '@angular/forms';
import { Component, Input, ContentChild, TemplateRef } from '@angular/core';

// Blockframes
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { FormStaticValue } from '@blockframes/utils/form';
import { Scope, SlugAndLabel } from '@blockframes/utils/static-model/staticModels';
import { staticModels } from '@blockframes/utils/static-model';

// RxJs
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: '[scope]static-input',
  templateUrl: './static-input.component.html',
  styleUrls: ['./static-input.component.scss']
})
export class StaticInputComponent {
  @Input() label?: string;

  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline'

  public _scope: SlugAndLabel[];

  @Input() set scope(value: string) {
    this._scope = staticModels[value];
  }
  @Input() control: FormStaticValue<Scope> = new FormControl();

  filteredStates: Observable<SlugAndLabel[]>;

  @ContentChild(TemplateRef) template: TemplateRef<any>;

  constructor() {
    this.filteredStates = this.control.valueChanges
      .pipe(
        startWith(''),
        map(state => state ? this.filterStates(state) : this._scope.slice()),
      );
  }

  private filterStates(value: string) {
    const filterValue = value.toLowerCase();
    return this._scope.filter(state => state.slug.toLowerCase().indexOf(filterValue) === 0);
  }

  displayFn(name: string) {
    return getLabelBySlug('GENRES', name)
  }
}
