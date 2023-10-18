import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  Movie,
  Right,
  RightholderRole,
  Statement,
  Waterfall,
  WaterfallRightholder,
  getStatementsHistory,
  mainCurrency,
  movieCurrencies
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { WaterfallService, WaterfallState } from '@blockframes/waterfall/waterfall.service';

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
  private statements: Statement[];
  public options = { xAxis: { categories: [] }, series: [] };
  public formatter = { formatter: (value: number) => `${value} ${movieCurrencies[mainCurrency]}` };
  public state: WaterfallState;

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    const rightholderId = this.route.snapshot.paramMap.get('rightholderId');
    const data = await this.waterfallService.loadWaterfalldata(waterfallId);
    this.movie = await this.movieService.getValue(waterfallId);
    this.waterfall = data.waterfall;
    this.statements = data.statements;
    this.rights = data.rights.filter(r => r.rightholderId === rightholderId);
    this.rightholder = this.waterfall.rightholders.find(r => r.id === rightholderId);

    this.waterfallRoleControl.setValue(this.rightholder.roles);

    this.state = await this.waterfallService.buildWaterfall({ waterfallId: this.waterfall.id, versionId: this.waterfall.versions[0].id });
    const rolesWithStatements: RightholderRole[] = ['salesAgent', 'mainDistributor', 'localDistributor', 'producer', 'coProducer'];
    if (this.rightholder.roles.some(r => rolesWithStatements.includes(r))) this.buildGraph();
    this.cdRef.markForCheck();
  }

  public async save() {
    const index = this.waterfall.rightholders.indexOf(this.rightholder);
    this.rightholder.roles = this.waterfallRoleControl.value;
    this.waterfall.rightholders[index] = this.rightholder;

    await this.waterfallService.update({ id: this.waterfall.id, rightholders: this.waterfall.rightholders });

    this.snackBar.open('Roles updated', 'close', { duration: 3000 });
  }

  private buildGraph() {

    const history = getStatementsHistory(this.state.waterfall.history, this.statements, this.rightholder.id);

    const categories = history.map(h => new Date(h.date).toISOString().slice(0, 10));
    const series = [
      {
        name: 'Profits',
        data: history.map(h => Math.round(h.orgs[this.rightholder.id].revenu.actual))
      },
      {
        name: 'Distributed',
        data: history.map(h => {
          const orgState = h.orgs[this.rightholder.id];
          return Math.round(orgState.turnover.actual - orgState.revenu.actual);
        })
      }
    ];
    this.options = { xAxis: { categories }, series };
  }

  public getRightRevenue(rightId: string) {
    const right = this.state.waterfall.state.rights[rightId];
    return { [mainCurrency]: right.revenu.actual };
  }
}