import DATA_ANETTE from './annette';

const DATA = [DATA_ANETTE];

export function getMovie(movieId: string): any {
  const xs = DATA.filter((x: any) => x.id === movieId);

  if (xs.length === 0) {
    return null;
  } else {
    return xs[0];
  }
}

export default DATA;
