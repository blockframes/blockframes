import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'festival-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {

  constructor(
    private router: Router
  ) {}

  public goToMovieDetails(id: string) {
    this.router.navigateByUrl(`c/o/marketplace/title/${id}`);
  }
}
