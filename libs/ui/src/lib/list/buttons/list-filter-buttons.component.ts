import {
  Component,
  ChangeDetectionStrategy,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  Input,
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

  private savedSearchIdentifier: 'saved-search'
  private queryParamsSub: Subscription;

  @Output() data: EventEmitter<string> = new EventEmitter();

  constructor(
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    @Inject(APP) private app: App,
  ) { }


  ngOnInit() {
    this.queryParamsSub = this.route.queryParams.subscribe(() => this.setButtonsState())
  }

  ngOnDestroy() {
    this.queryParamsSub.unsubscribe();
  }
  save() {
    const routeParams = decodeUrl(this.route);
    localStorage.setItem(`${this.app}-${this.savedSearchIdentifier}`, JSON.stringify(routeParams));
    this.setButtonsState();
  }

  load() {
    const routeParams = localStorage.getItem(`${this.app}-${this.savedSearchIdentifier}`);
    const parsedData = JSON.parse(routeParams);
    this.data.emit(parsedData);
  }

  setButtonsState() {
    const dataStorage = localStorage.getItem(`${this.app}-${this.savedSearchIdentifier}`);
    const currentRouteParams = this.route.snapshot.queryParams.formValue;
    if (dataStorage) this.buttonsState.save = 'active', this.buttonsState.load = 'enabled';
    if (dataStorage === currentRouteParams) this.buttonsState.save = 'enabledAndActive', this.buttonsState.load = 'active';
    this.cdRef.markForCheck();
  }
}
