// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Blockframes


@Component({
  selector: 'waterfall-title-statements-distrib',
  templateUrl: './statements-distrib.component.html',
  styleUrls: ['./statements-distrib.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementsDistribComponent {
  path = '/assets/images/demo-cannes/distrib-statements/Statement_1.svg';
  movieId = this.route.snapshot.params.movieId;
  constructor(private router: Router,private route: ActivatedRoute,) {

  }

  switch() {

    if (this.path === '/assets/images/demo-cannes/distrib-statements/Statement_1.svg') {
      this.path = '/assets/images/demo-cannes/distrib-statements/Statement_2.svg';
    } else if (this.path === '/assets/images/demo-cannes/distrib-statements/Statement_2.svg') {
      this.path = '/assets/images/demo-cannes/distrib-statements/Statement_3.svg';
    } else if (this.path === '/assets/images/demo-cannes/distrib-statements/Statement_3.svg') {
      this.path = '/assets/images/demo-cannes/distrib-statements/Statement_4.svg';
    } else if (this.path === '/assets/images/demo-cannes/distrib-statements/Statement_4.svg') {
      this.path = '/assets/images/demo-cannes/distrib-statements/Statement_5.svg';
    } else if (this.path === '/assets/images/demo-cannes/distrib-statements/Statement_5.svg') {
      this.path = '/assets/images/demo-cannes/distrib-statements/Statement_6.svg';
    } else if (this.path === '/assets/images/demo-cannes/distrib-statements/Statement_6.svg') {
      this.path = '/assets/images/demo-cannes/distrib-statements/Statement_7.svg';
    } else if (this.path === '/assets/images/demo-cannes/distrib-statements/Statement_7.svg') {
      this.path = '/assets/images/demo-cannes/distrib-statements/Statement_8.svg';
    } else if (this.path === '/assets/images/demo-cannes/distrib-statements/Statement_8.svg') {
      this.path = '/assets/images/demo-cannes/distrib-statements/Statement_9.svg';
    } else if (this.path === '/assets/images/demo-cannes/distrib-statements/Statement_9.svg') {
      this.path = '/assets/images/demo-cannes/distrib-statements/Statement_10.svg';
    } else {
      this.router.navigate(['/c/o/dashboard/title',this.movieId, 'statements']);
    }

  }
}
