// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Blockframes


@Component({
  selector: 'waterfall-title-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementsComponent {

  topPath = '/assets/images/demo-cannes/Nav_Distrib.svg';
  path = '/assets/images/demo-cannes/Statements_Distrib.svg';
  movieId = this.route.snapshot.paramMap.get('movieId');

  constructor(
    private route: ActivatedRoute,
    private router: Router) {

  }

  switchTop() {
    if (this.topPath === '/assets/images/demo-cannes/Nav_Distrib.svg') {
      this.topPath = '/assets/images/demo-cannes/Nav_Coprod.svg';
      this.path = '/assets/images/demo-cannes/Statements_Coprod.png'
    } else {
      this.topPath = '/assets/images/demo-cannes/Nav_Distrib.svg';
      this.path = '/assets/images/demo-cannes/Statements_Distrib.svg'
    }
  }

  goTo() {
    if (this.topPath === '/assets/images/demo-cannes/Nav_Distrib.svg') {
      this.router.navigate(['/c/o/dashboard/waterfall/', this.movieId, 'statement-distrib'], { relativeTo: this.route });
    } else {
      this.router.navigate(['/c/o/dashboard/waterfall/', this.movieId, 'statement-coprod'], { relativeTo: this.route });
    }

  }
}
