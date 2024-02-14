// Angular
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'waterfall-right-holders',
  templateUrl: './right-holders.component.html',
  styleUrls: ['./right-holders.component.scss'],

})
export class RightHoldersComponent {
  path = '/assets/images/demo-cannes/Creation_Waterfall_1.svg';

  movieId = this.route.snapshot.params.movieId;
  constructor(private router: Router,private route: ActivatedRoute,) {

  }


  switch() {
    if (this.path === '/assets/images/demo-cannes/Creation_Waterfall_1.svg') {
      this.path = '/assets/images/demo-cannes/Creation_Waterfall_2.svg';
    } else if (this.path === '/assets/images/demo-cannes/Creation_Waterfall_2.svg') {
      this.path = '/assets/images/demo-cannes/Creation_Waterfall_3.svg';
    } else if (this.path === '/assets/images/demo-cannes/Creation_Waterfall_3.svg') {
      this.path = '/assets/images/demo-cannes/creation-interactive.svg';
    } else {
      this.router.navigate(['/c/o/dashboard/title',this.movieId, 'waterfall']);
    }
  }
}

