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

    const ids = [
      /*'tt3675748',
      'tt4029998',
      'tt4062536',
      'tt5041296',
      'tt4016934',
      'tt5462326',
      'tt6266218',
      'tt1974419',
      'tt7715270',
      'tt6958212',
      'tt2396489',
      'tt7082742',
      'tt6869538',
      'tt8368406',
      'tt12715472',
      'tt7160176',
      'tt4547194',
      'tt6301712',
      'tt2315596',
      'tt7087210',
      'tt7334342',
      'tt6820256',
      'tt6751668',
      'tt8351520',
      'tt8639136',
      'tt7329642',
      'tt7852002',
      'tt4397342',
      'tt6043142',
      'tt8781414',
      'tt7294150',
      'tt6921496',
      'tt8368294',
      'tt10919074',
      'tt0118694',*/
      'tt10469804',
      'tt13845758',
      'tt11358398',
      'tt9812474',
      'tt8550054',
      'tt14757872',
      'tt5918982',
      /*'tt12519030',
      'tt13274576',
      'tt13109952',
      'tt0161292',
      'tt0040536',
      'tt0040558',
      'tt0040766',
      'tt0047478',
      'tt0067541',
      'tt0059792',*/
    ]

    for(const id of ids){
      await this.myapimoviesService.createTitle(id);
    }
    

    // const seasons = await this.myapimoviesService.seasons('tt4063800');
    // console.log(seasons);

    //  const season = await this.myapimoviesService.season('tt4063800', 1);
    // console.log(season);

    // const akas = await this.myapimoviesService.akas('tt2392672');
    //console.log(akas);

    //const genres = await this.myapimoviesService.genres('tt0107290');
    // console.log(genres);

    //const health = await this.myapimoviesService.health();
    //console.log(health);
  }

}
