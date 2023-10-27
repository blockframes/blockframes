
import { Subscription, debounceTime } from 'rxjs';
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { createWaterfallRightholder } from '@blockframes/model';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { WaterfallRightholderForm, WaterfallRightholderFormValue } from '@blockframes/waterfall/form/right-holder.form';
import { FormList } from '@blockframes/utils/form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'waterfall-right-holders',
  templateUrl: './right-holders.component.html',
  styleUrls: ['./right-holders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightHoldersComponent implements OnInit, OnDestroy {

  rightholdersForm = FormList.factory<WaterfallRightholderFormValue, WaterfallRightholderForm>([], rightholder => new WaterfallRightholderForm(rightholder));
  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private waterfallService: WaterfallService,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
  ) { 
    this.dynTitle.setPageTitle('Manage Right Holders');
  }

  async ngOnInit() {
    const movieId: string = this.route.snapshot.params.movieId;
    const waterfall = await this.waterfallService.getValue(movieId);
    if (waterfall.rightholders.length === 0) this.rightholdersForm.add(createWaterfallRightholder());
    waterfall.rightholders.forEach(rightholder => this.rightholdersForm.add(rightholder));
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
      await this.waterfallService.update({ id: waterfall.id, rightholders: newRightholders });
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}

