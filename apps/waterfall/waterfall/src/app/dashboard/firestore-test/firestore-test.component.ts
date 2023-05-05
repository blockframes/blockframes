import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BlockService } from '@blockframes/waterfall/block.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  compensation1 as compensation1_mg,
  compensation2 as compensation2_mg,
  firstIncome as firstIncome_mg,
  secondIncome as secondIncome_mg,
  initBlock as initBlock_mg,
  stories as stories_mg,
  rnpp as rnpp_mg
} from '@blockframes/waterfall/fixtures/examples/side-stories-mg';
import {
  compensation1 as compensation1_expenses,
  firstIncome as firstIncome_expenses,
  secondIncome as secondIncome_expenses,
  initBlock as initBlock_expenses,
  stories as stories_expenses
} from '@blockframes/waterfall/fixtures/examples/side-stories-expense';
import {
  stories as stories_incomes,
  next as next_incomes
} from '@blockframes/waterfall/fixtures/examples/side-stories-incomes';
import { ActivatedRoute } from '@angular/router';
import { Version, Waterfall, createWaterfall, OrgState, TitleState, History } from '@blockframes/model';

@Component({
  selector: 'waterfall-firestore-test',
  templateUrl: './firestore-test.component.html',
  styleUrls: ['./firestore-test.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FirestoreTestComponent implements OnInit {

  private actions = {
    'side-stories-mg': stories_mg,
    'side-stories-expense': stories_expenses,
    'side-stories-incomes': stories_incomes,
  }

  public waterfallId: keyof typeof this.actions = this.route.snapshot.params['titleId'];
  public stories: { waterfall: { state: TitleState; history: History[] }, version: Version }[] = [];
  public waterfall?: Waterfall;

  constructor(
    private blockService: BlockService,
    private waterfallService: WaterfallService,
    private cdr: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit() {
    // Reset
    await Promise.all([
      this.waterfallService.remove(this.waterfallId),
      this.blockService.removeAll({ params: { waterfallId: this.waterfallId } })
    ]);

    // Populate
    this.scenario();
  }

  private async scenario() {
    this.snackbar.open(`Running scenario ${this.waterfallId}...`);
    this.waterfall = await this.waterfallService.create(this.waterfallId);

    switch (this.waterfallId) {
      case 'side-stories-mg': {
        await this.waterfallService.add(createWaterfall({ id: this.waterfallId }));

        // Init versions
        this.waterfall = await this.waterfallService.addVersion(this.waterfall, {
          id: 'version_1_MG50k',
          description: 'Seller have a 50k MG'
        });

        this.waterfall = await this.waterfallService.addVersion(this.waterfall, {
          id: 'version_2_MG80k',
          description: 'Seller have a 80k MG'
        });

        this.waterfall = await this.waterfallService.addVersion(this.waterfall, {
          id: 'version_3_MG50k_Resolution',
          description: 'Producer compensates incomes'
        });

        // Blocks common for all stories
        const init = await this.blockService.create(this.waterfallId, 'init', initBlock_mg);
        const income1 = await this.blockService.create(this.waterfallId, 'income1', firstIncome_mg);
        const income2 = await this.blockService.create(this.waterfallId, 'income2', secondIncome_mg);
        const rnpp = await this.blockService.create(this.waterfallId, 'rnpp', rnpp_mg);

        // Stories
        const story1 = await this.blockService.create(this.waterfallId, '50kMG', stories_mg[0]);
        this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, 'version_1_MG50k', [init, story1, rnpp, income1, income2]);

        const story2 = await this.blockService.create(this.waterfallId, '80kMG', stories_mg[1]);
        this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, 'version_2_MG80k', [init, story2, rnpp, income1, income2]);

        // Compensation
        const comp1 = await this.blockService.create(this.waterfallId, 'compensation', compensation1_mg);
        const comp2 = await this.blockService.create(this.waterfallId, 'compensation', compensation2_mg);
        this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, 'version_3_MG50k_Resolution', [init, story1, rnpp, income1, comp1, income2, comp2]);
        break;
      }
      case 'side-stories-expense': {
        await this.waterfallService.add(createWaterfall({ id: this.waterfallId }));

        // Init versions
        this.waterfall = await this.waterfallService.addVersion(this.waterfall, {
          id: 'version_1_Expenses100k',
          description: 'Seller have 100k expenses'
        });

        this.waterfall = await this.waterfallService.addVersion(this.waterfall, {
          id: 'version_2_Expenses150k',
          description: 'Seller have 150k expenses'
        });

        this.waterfall = await this.waterfallService.addVersion(this.waterfall, {
          id: 'version_3_Expenses120k',
          description: 'Seller have 120k expenses'
        });

        this.waterfall = await this.waterfallService.addVersion(this.waterfall, {
          id: 'version_4_Expenses150k_Resolution',
          description: 'Seller have 150k expenses and produced compensates incomes'
        });

        // Blocks common for all stories
        const init = await this.blockService.create(this.waterfallId, 'init', initBlock_expenses);
        const income1 = await this.blockService.create(this.waterfallId, 'income1', firstIncome_expenses);
        const income2 = await this.blockService.create(this.waterfallId, 'income2', secondIncome_expenses);

        // Stories
        const story1 = await this.blockService.create(this.waterfallId, 'Expenses100k', stories_expenses[0]);
        this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, 'version_1_Expenses100k', [init, story1, income1, income2]);

        const story2 = await this.blockService.create(this.waterfallId, 'Expenses150k', stories_expenses[1]);
        this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, 'version_2_Expenses150k', [init, story2, income1, income2]);

        const story3 = await this.blockService.create(this.waterfallId, 'Expenses120k', stories_expenses[2]);
        this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, 'version_3_Expenses120k', [init, story3, income1, income2]);

        // Compensation
        const comp1 = await this.blockService.create(this.waterfallId, 'Expenses150k_Resolution', compensation1_expenses);
        this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, 'version_4_Expenses150k_Resolution', [init, story2, income1, comp1, income2]);

        break;
      }
      case 'side-stories-incomes': {
        await this.waterfallService.add(createWaterfall({ id: this.waterfallId }));

        // Init versions
        this.waterfall = await this.waterfallService.addVersion(this.waterfall, {
          id: 'version_1_current',
          description: 'Current situation'
        });

        this.waterfall = await this.waterfallService.addVersion(this.waterfall, {
          id: 'version_2_20k_income',
          description: 'With 20k income'
        });


        // Stories
        const story1 = await this.blockService.create(this.waterfallId, 'story1', stories_incomes[0]);
        const next1 = await this.blockService.create(this.waterfallId, 'next1', next_incomes[0]);
        this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, 'version_1_current', [story1, next1]);

        const story2 = await this.blockService.create(this.waterfallId, 'story2', stories_incomes[1]);
        const next2 = await this.blockService.create(this.waterfallId, 'next2', next_incomes[1]);
        this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, 'version_2_20k_income', [story2, next2]);
        break;
      }
      default:
        break;
    }

    await this.run();
    this.snackbar.open(`Scenario ${this.waterfallId} loaded`, 'close', { duration: 5000 });
  }

  async run() {
    try {
      this.waterfall = await this.waterfallService.getValue(this.waterfallId);
      if (!this.waterfall) {
        this.snackbar.open(`Waterfall ${this.waterfallId} not found`);
        return;
      }

      const promises = this.waterfall.versions.map(({ id }) => this.waterfallService.buildWaterfall(
        {
          waterfallId: this.waterfallId,
          versionId: id
        })
      );
      this.stories = await Promise.all(promises);

      this.cdr.markForCheck();
    } catch (error) {
      this.snackbar.open((error as Error).message, 'close', { duration: 5000 });
    }
  }

  public diff(a: OrgState, compareTo: TitleState) {
    if (a.revenu < compareTo.orgs[a.id]?.revenu) return 'red';
    if (a.revenu > compareTo.orgs[a.id]?.revenu) return 'green';
    return '';
  }
}
