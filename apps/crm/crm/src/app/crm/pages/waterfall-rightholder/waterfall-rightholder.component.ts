import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Movie, Right, RightholderRole, Waterfall, WaterfallRightholder } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { RightService } from '@blockframes/waterfall/right.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { where } from 'firebase/firestore';

@Component({
  selector: 'crm-waterfall-rightholder',
  templateUrl: './waterfall-rightholder.component.html',
  styleUrls: ['./waterfall-rightholder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallRightholderComponent implements OnInit {
  public movie: Movie;
  public waterfall: Waterfall;
  public rightholder: WaterfallRightholder;
  public waterfallRoleControl = new FormControl<RightholderRole[]>(undefined, [Validators.required]);
  public rights: Right[] = [];

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private rightService: RightService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    const rightholderId = this.route.snapshot.paramMap.get('rightholderId');
    const [movie, waterfall, rights] = await Promise.all([
      this.movieService.getValue(waterfallId),
      this.waterfallService.getValue(waterfallId),
      this.rightService.getValue([where('rightholderId', '==', rightholderId)], { waterfallId }),
    ]);

    this.movie = movie;
    this.waterfall = waterfall;
    this.rights = rights;

    this.rightholder = this.waterfall.rightholders.find(r => r.id === rightholderId);

    this.waterfallRoleControl.setValue(this.rightholder.roles);

    this.cdRef.markForCheck();
  }

  public async save() {
    const index = this.waterfall.rightholders.indexOf(this.rightholder);
    this.rightholder.roles = this.waterfallRoleControl.value;
    this.waterfall.rightholders[index] = this.rightholder;

    await this.waterfallService.update({ id: this.waterfall.id, rightholders: this.waterfall.rightholders });

    this.snackBar.open('Roles updated', 'close', { duration: 3000 });
  }
}