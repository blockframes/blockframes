// Angular
import { FormControl } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';

// Blockframes
import { RightholderRole } from '@blockframes/model';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';
import { OrganizationService } from '@blockframes/organization/service';

@Component({
  selector: '[movieId] waterfall-title-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleFormComponent implements OnInit {

  @Input() movieForm: MovieForm;
  @Input() waterfallRoleControl: FormControl<RightholderRole[]>;
  @Input() movieId = '';
  @Input() createMode = true;

  public isProducer$: Observable<boolean>;

  constructor(
    private orgService: OrganizationService,
    private permissionService: WaterfallPermissionsService
  ) { }

  ngOnInit() {
    this.isProducer$ = this.permissionService.valueChanges(this.orgService.org.id, { waterfallId: this.movieId }).pipe(
      map(permission => permission?.roles.some(r => r === 'producer'))
    );
  }

  addDirector() {
    this.movieForm.directors.add({ firstName: '', lastName: '' });
  }

  removeDirector(index: number) {
    this.movieForm.directors.removeAt(index);
  }
}
