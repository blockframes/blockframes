import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { User } from '@blockframes/auth/+state/auth.store';

@Component({
  selector: 'user-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent implements OnInit {

  @Input() user: User;
  constructor() { }

  ngOnInit(): void {
  }

}
