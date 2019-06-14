import { Injectable } from '@angular/core';
import { createMovieStakeholder, StakeholderService } from '../../stakeholder/+state';
import { Movie, createMovie } from './movie.model';
import { FireQuery } from '@blockframes/utils';

@Injectable({ providedIn: 'root' })

export class MovieService {

  constructor(
  private db: FireQuery,
  private shService: StakeholderService
  ) {}

  public async add(original: string, orgId: string, firstAdd: boolean = false ): Promise<Movie> {
    const id = this.db.createId();
    const owner = createMovieStakeholder({orgId, orgMovieRole: 'ADMIN', isAccepted: true});
    const movie: Movie = createMovie({ id, title: { original }});

    // TODO: correct race condition
    await this.db.createAndSetRights<Movie>(movie, orgId);

    await this.shService.add(id, owner, firstAdd);

    return movie;
  }

  public update(id: string, movie: any) {
    // we don't want to keep orgId in our Movie object
    if (movie.org) delete movie.org;
    if (movie.stakeholders) delete movie.stakeholders;

    this.db.doc<Movie>(`movies/${id}`).update(movie);
  }

  public remove(id: string) {
    this.db.doc<Movie>(`movies/${id}`).delete();
  }

}
