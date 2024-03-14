
import { Subscription, debounceTime } from 'rxjs';
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Waterfall, createWaterfallRightholder } from '@blockframes/model';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { WaterfallRightholderForm, WaterfallRightholderFormValue } from '@blockframes/waterfall/form/right-holder.form';
import { FormList } from '@blockframes/utils/form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieService } from '@blockframes/movie/service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'waterfall-right-holders-management',
  templateUrl: './right-holders-management.component.html',
  styleUrls: ['./right-holders-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightHoldersManagementComponent implements OnInit, OnDestroy {

  rightholdersForm = FormList.factory<WaterfallRightholderFormValue, WaterfallRightholderForm>([], rightholder => new WaterfallRightholderForm(rightholder));
  private subscription?: Subscription;
  public movie$ = this.movieService.valueChanges(this.route.snapshot.params.movieId as string);
  public waterfall: Waterfall;

  constructor(
    private route: ActivatedRoute,
    private waterfallService: WaterfallService,
    private movieService: MovieService,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private snackbar: MatSnackBar,
  ) {
    this.dynTitle.setPageTitle('Manage Right Holders');
  }

  async ngOnInit() {
    const movieId: string = this.route.snapshot.params.movieId;
    this.waterfall = await this.waterfallService.getValue(movieId);
    if (this.waterfall.rightholders.length === 0) this.rightholdersForm.add(createWaterfallRightholder());
    this.waterfall.rightholders.forEach(rightholder => this.rightholdersForm.add(rightholder));
    this.cdr.markForCheck();

    this.subscription = this.rightholdersForm.valueChanges.pipe(
      debounceTime(3000), // avoid triggering save on every key stroke
    ).subscribe(async rightholders => {
      // Remove form value with no names and no roles and format the good values
      const newRightholders = rightholders.filter(rightholder => rightholder.name || rightholder.roles.length)
        .map(rightholder => createWaterfallRightholder({
          ...rightholder,
          id: rightholder.id || this.waterfallService.createId(),
        }))
        ;

      // ! `id` needs to be in the update object, because of a bug in ng-fire
      await this.waterfallService.update({ id: this.waterfall.id, rightholders: newRightholders });
      this.snackbar.open('Role(s) updated', 'close', { duration: 5000 });
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}

