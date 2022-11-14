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
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@blockframes/auth/service';
import { App, MovieAvailsSearch } from '@blockframes/model';
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

  private queryParamsSub: Subscription;

  @Output() data: EventEmitter<MovieAvailsSearch> = new EventEmitter();

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    @Inject(APP) private app: App,
  ) { }


  ngOnInit() {
    this.queryParamsSub = this.route.queryParams.subscribe(() => this.setButtonsState())
  }

  ngOnDestroy() {
    this.queryParamsSub.unsubscribe();
  }

  async save() {
    const routeParams = decodeUrl<MovieAvailsSearch>(this.route);
    delete routeParams.search?.page;
    const savedSearches = this.authService.profile.savedSearches ?? {};
    savedSearches[this.app] = JSON.stringify(routeParams);
    await this.authService.update({ savedSearches });
    this.setButtonsState();
    this.snackbar.open('Research successfully saved.', 'close', { duration: 5000 });
  }

  load() {
    const savedSearches = this.authService.profile.savedSearches ?? {};
    const parsedData: MovieAvailsSearch = JSON.parse(savedSearches[this.app]);
    this.data.emit(parsedData);
  }

  setButtonsState() {
    const savedSearches = this.authService.profile.savedSearches ?? {};
    const savedSearch = savedSearches[this.app];

    const currentRouteParams: MovieAvailsSearch = JSON.parse(this.route.snapshot.queryParams.formValue ?? '{}');
    delete currentRouteParams.search?.page;

    if (savedSearch) this.buttonsState.save = 'active', this.buttonsState.load = 'enabled';
    if (savedSearch === JSON.stringify(currentRouteParams)) this.buttonsState.save = 'enabledAndActive', this.buttonsState.load = 'active';
    this.cdr.markForCheck();
  }
}
