import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ImdbService } from '@blockframes/utils';

@Component({
  selector: 'catalog-imdb-api-test',
  templateUrl: './imdb-api-test.component.html',
  styleUrls: ['./imdb-api-test.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImdbApiTestComponent implements OnInit {

  constructor(private imdbService: ImdbService) {}

  ngOnInit() {
    const apiKey = '4d1be897';
    this.imdbService.setApiKey(apiKey)

    // Get movie by name
    this.imdbService.get({name: 'The Toxic Avenger'}).then(console.log).catch(console.log);

    // Get movie by name and year
    this.imdbService.get({name: 'The Toxic Avenger', year: 1984}).then(console.log).catch(console.log);

    // Get movie by id
    this.imdbService.get({id: 'tt0120338'}).then(console.log).catch(console.log);

    // Search by title
    this.imdbService.search({name: 'titanic' }).then(console.log).catch(console.log);

    // Search by title and year
    this.imdbService.search({name: 'titanic', year: 1997}).then(console.log).catch(console.log);


  }
}
