import {
  Component,
  ChangeDetectionStrategy,
  Directive,
  Input,
  TemplateRef,
  ContentChildren,
  QueryList,
  OnInit
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { App } from '@blockframes/model';
import { hasValue } from '@blockframes/utils/pipes';
import { decodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export type FilterButtonsState = Record<'save' | 'load', 'enabled' | 'active' | 'enabledAndActive' | 'disabled'>;

const savedSearchIdentifier = 'saved-search';

export function setButtonsState(currentRouteParams: string, app: App, buttons: FilterButtonsState) {
  const dataStorage = localStorage.getItem(`${app}-${savedSearchIdentifier}`);
  if (dataStorage) buttons.save = 'active', buttons.load = 'enabled';
  if (dataStorage === currentRouteParams) buttons.save = 'enabledAndActive', buttons.load = 'active';
}

/**
 * Save route parameters to local storage
 * @param route 
 * @param app 
 */
 export function saveParamsToStorage(route: ActivatedRoute, app: App) {
  const routeParams = decodeUrl(route);
  localStorage.setItem(`${app}-${savedSearchIdentifier}`, JSON.stringify(routeParams));
}
/**
 * Retreive stored route parameters
 * @param app 
 */
export function loadParamsFromStorage(app: App) {
  const routeParams = localStorage.getItem(`${app}-${savedSearchIdentifier}`);
  return JSON.parse(routeParams);
}

@Directive({ selector: '[filter]' })
export class FilterDirective implements OnInit {
  @Input() label = 'filter name';
  @Input() form: AbstractControl;
  private active$ = new BehaviorSubject(false);
  public color$: Observable<'primary' | ''>;
  constructor(public template: TemplateRef<unknown>) { }

  set active(isActive: boolean) {
    this.active$.next(isActive);
  }

  ngOnInit() {
    this.color$ = combineLatest([
      this.active$,
      this.form.valueChanges.pipe(startWith(this.form.value)),
    ]).pipe(
      map(([active, value]) => active || (hasValue(value) && this.form.valid)),
      map(hasColor => hasColor ? 'primary' : '')
    );
  }
}

@Component({
  selector: 'list-filter',
  templateUrl: './list-filter.component.html',
  styleUrls: ['./list-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListFilterComponent {
  @ContentChildren(FilterDirective) filters: QueryList<FilterDirective>;
}
