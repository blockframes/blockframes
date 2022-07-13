import {
  Component,
  ChangeDetectionStrategy,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { App } from '@blockframes/model';
import { decodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { APP } from '@blockframes/utils/routes/utils';
import { Subscription } from 'rxjs';

type FilterButtonsState = Record<'save' | 'load', 'enabled' | 'active' | 'enabledAndActive' | 'disabled'>;

@Component({
  selector: 'list-filter-buttons',
  templateUrl: './list-filter-buttons.component.html',
  styleUrls: ['./list-filter-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListFilterButtonsComponent implements OnDestroy, OnInit {

  public buttonsState: FilterButtonsState = {
    save: 'enabled',
    load: 'disabled',
  }

  private savedSearchIdentifier: 'saved-search';
  private queryParamsSub: Subscription;

  @Output() data: EventEmitter<string> = new EventEmitter();

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(APP) public app: App,
  ) { }


  ngOnInit() {
    this.queryParamsSub = this.route.queryParams.subscribe(_ => this.setButtonsState(this.app, this.buttonsState));
  }

  ngOnDestroy() {
    this.queryParamsSub.unsubscribe();
  }

  save() {
    const routeParams = decodeUrl(this.route);
    localStorage.setItem(`${this.app}-${this.savedSearchIdentifier}`, JSON.stringify(routeParams));
    this.setButtonsState(this.app, this.buttonsState);
  }

  load() {
    const routeParams = localStorage.getItem(`${this.app}-${this.savedSearchIdentifier}`);
    const parsedData = JSON.parse(routeParams);
    this.data.emit(parsedData);
  }

  setButtonsState(app: App, buttons: FilterButtonsState) {
    const dataStorage = localStorage.getItem(`${app}-${this.savedSearchIdentifier}`);
    const currentRouteParams = this.route.snapshot.queryParams.formValue;
    if (dataStorage) buttons.save = 'active', buttons.load = 'enabled';
    if (dataStorage === currentRouteParams) buttons.save = 'enabledAndActive', buttons.load = 'active';
    this.cdr.markForCheck();
  }
}
