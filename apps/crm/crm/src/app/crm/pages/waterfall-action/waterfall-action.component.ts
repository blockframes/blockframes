import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Movie, Waterfall, Block, Action, ActionList } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';

import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { BlockService } from '@blockframes/waterfall/block.service';

@Component({
  selector: 'crm-waterfall-action',
  templateUrl: './waterfall-action.component.html',
  styleUrls: ['./waterfall-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallActionComponent implements OnInit {
  public movie: Movie;
  public waterfall: Waterfall;
  public blocks: Block[];
  public block: Block;
  public action: Action;

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private blockService: BlockService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    const blockId = this.route.snapshot.paramMap.get('blockId');
    const actionId = this.route.snapshot.paramMap.get('actionId');

    const [movie, waterfall, blocks] = await Promise.all([
      this.movieService.getValue(waterfallId),
      this.waterfallService.getValue(waterfallId),
      this.blockService.getValue({ waterfallId })
    ]);

    this.movie = movie;
    this.waterfall = waterfall;
    this.blocks = blocks;
    this.block = this.blocks.find(b => b.id === blockId);
    this.action = this.block.actions[actionId];

    this.cdRef.markForCheck();
  }

  public payload(action: Action) {
    switch (action.name) {
      case 'append':
        return action.payload as ActionList['append']['payload'];
      case 'prepend':
        return action.payload as ActionList['prepend']['payload'];
      case 'prependHorizontal':
        return action.payload as ActionList['prependHorizontal']['payload'];
      case 'appendHorizontal':
        return action.payload as ActionList['appendHorizontal']['payload'];
      default:
        return action.payload as any;
    }

  }

}