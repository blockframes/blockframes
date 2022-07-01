import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { firebase } from '@env';
import { AuthService } from '@blockframes/auth/service';
import { firstValueFrom } from 'rxjs';
import { MyapimoviesService } from '@blockframes/utils/myapimovies/myapimovies.service';

@Component({
  selector: 'crm-dev-area',
  templateUrl: './dev-area.component.html',
  styleUrls: ['./dev-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevAreaComponent implements OnInit {
  public token: string;
  public projectId = firebase().projectId;
  public firebaseConsoleLink = `https://console.firebase.google.com/project/${this.projectId}/database/`;

  constructor(
    private authService: AuthService,
    private myapimoviesService: MyapimoviesService,
    private cdRef: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.token = await firstValueFrom(this.authService.user$)
      .then(user => user.getIdToken());
    this.cdRef.markForCheck();


    const movie = await this.myapimoviesService.movie('tt0107290');
    console.log(movie);

    const genres = await this.myapimoviesService.genres('tt0107290');
    console.log(genres);

    //const health = await this.myapimoviesService.health();
    //console.log(health);
  }

}
