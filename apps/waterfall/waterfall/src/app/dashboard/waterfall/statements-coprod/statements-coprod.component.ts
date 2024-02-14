// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Blockframes


@Component({
  selector: 'waterfall-title-statements-coprod',
  templateUrl: './statements-coprod.component.html',
  styleUrls: ['./statements-coprod.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementsCoprodComponent {

  path = '/assets/images/demo-cannes/outgoing-statements/Outgoing_1.svg';

  movieId = this.route.snapshot.params.movieId;
  constructor(private router: Router,private route: ActivatedRoute,) {

  }

  switch() {
    if (this.path === '/assets/images/demo-cannes/outgoing-statements/Outgoing_1.svg') {
      this.path = '/assets/images/demo-cannes/outgoing-statements/Outgoing_2.svg';
    } else {
      this.router.navigate(['/c/o/dashboard/title',this.movieId, 'statements']);
    }
  }
}
