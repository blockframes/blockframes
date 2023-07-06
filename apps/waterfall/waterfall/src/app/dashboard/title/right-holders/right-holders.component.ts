
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormControl, FormGroup} from '@angular/forms';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { RightholderRole, WaterfallRightholder } from '@blockframes/model';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';


@Component({
  selector: 'waterfall-right-holders',
  templateUrl: './right-holders.component.html',
  styleUrls: ['./right-holders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightHoldersComponent implements OnInit {

  rightholdersForm = new FormArray<FormGroup<{ id: FormControl<string>, name: FormControl<string>, roles: FormControl<RightholderRole[]> }>>([
    new FormGroup({ id: new FormControl(this.waterfallService.createId()), name: new FormControl(''), roles: new FormControl([]) }),
  ]);

  movieId = '';

  constructor(
    private route: ActivatedRoute,
    private waterfallService: WaterfallService,
  ) { }

  async ngOnInit() {
    this.movieId = this.route.snapshot.params.movieId;
    const waterfall = await this.waterfallService.getValue(this.movieId);
    this.rightholdersForm.patchValue(waterfall.rightholders);
  }

  async update() {
    // Remove form value with no names and no roles and format the good values
      const rightholders: WaterfallRightholder[] = this.rightholdersForm.value.filter(rightholder => rightholder.name || rightholder.roles.length)
      .map(rightholder => ({ id: rightholder.id ?? this.waterfallService.createId(), name: rightholder.name ?? '', roles: rightholder.roles ?? [] }))
    ;

    // ! `id` needs to be in the update object, because of a bug in ng-fire
    await this.waterfallService.update({ id: this.movieId, rightholders });
  }
}

