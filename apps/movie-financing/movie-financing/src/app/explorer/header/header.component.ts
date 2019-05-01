import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'financing-explorer-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerHeaderComponent implements OnInit {

  @Input() title = 'Annette';
  @Input() subtitle = 'Leos Carax';
  @Input() label = 'logline';
  @Input() content = 'A stand-up comedian, and his opera singer wife, have a 2 year old daughter with a surprising gift.';

  constructor() {
  }

  ngOnInit() {
  }
}
