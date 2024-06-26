import { AvailsFilter } from '@blockframes/model';
import { allButSouthKorea, Europe } from './mandatesAndSales';

export const availDetailsExclusive: AvailsFilter = {
  duration: {
    from: new Date('06/01/2021'),
    to: new Date('12/01/2021'),
  },
  exclusive: true,
  territories: [],
  medias: ['educational']
};

export const availSouthKorea: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2023'),
  },
  exclusive: false,
  territories: ['south-korea'],
  medias: ['freeTv']
};

export const availAfghanistan: AvailsFilter = {
  duration: {
    from: new Date('01/01/2028'),
    to: new Date('06/30/2036'),
  },
  exclusive: false,
  territories: ['afghanistan'],
  medias: ['freeTv']
};

export const availFrance: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2023'),
  },
  exclusive: false,
  territories: ['france'],
  medias: ['inflight']
};

export const availsExistingEndedSales: AvailsFilter = {
  duration: {
    from: new Date('01/01/2033'),
    to: new Date('06/30/2033'),
  },
  exclusive: true,
  territories: ['germany', 'russia', 'czech'],
  medias: ['freeTv']
};

export const availsOngoingSales: AvailsFilter = {
  duration: {
    from: new Date('01/01/2029'),
    to: new Date('06/30/2031'),
  },
  exclusive: true,
  territories: ['germany', 'russia', 'czech'],
  medias: ['freeTv']
};

export const availsTerritoryWithoutExclusivity: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2022'),
  },
  exclusive: false,
  territories: ['germany', 'russia', 'czech'],
  medias: ['freeTv']
};

export const availsTerritoryWithExclusivity: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2022'),
  },
  exclusive: true,
  territories: ['germany', 'russia', 'czech'],
  medias: ['freeTv']
};

export const availsPayTvArgentina: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2022'),
  },
  exclusive: true,
  territories: ['argentina'],
  medias: ['payTv']
};

export const availssVODArgentina: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2022'),
  },
  exclusive: true,
  territories: ['argentina'],
  medias: ['sVod']
};

export const availsSVODArgentina: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2022'),
  },
  exclusive: true,
  territories: ['argentina'],
  medias: ['sVod']
};

export const availsPayTVArgentina: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2022'),
  },
  exclusive: true,
  territories: ['argentina'],
  medias: ['payTv']
};

export const availsGermany: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2022'),
  },
  exclusive: false,
  territories: ['germany'],
  medias: ['freeTv']
};

export const availsBelgium: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2023'),
  },
  exclusive: true,
  territories: ['belgium'],
  medias: ['sVod']
};

export const availsFranceLuxembourg: AvailsFilter = {
  duration: {
    from: new Date('01/01/2029'),
    to: new Date('06/30/2031'),
  },
  exclusive: false,
  territories: ['france', 'luxembourg'],
  medias: ['sVod']
};

export const availsAllButSouthKorea: AvailsFilter = {
  duration: {
    from: new Date('01/01/2031'),
    to: new Date('01/31/2035'),
  },
  exclusive: true,
  territories: allButSouthKorea,
  medias: ['payTv', 'payPerView', 'freeTv', 'est', 'nVod', 'aVod', 'fVod']
};

//movie list avails for example: library page
export const availsListSouthKorea: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2023'),
  },
  exclusive: false,
  territories: ['south-korea'],
  medias: ['freeTv']
};

export const availsListAfghanistan: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2036'),
  },
  exclusive: false,
  territories: ['afghanistan'],
  medias: ['freeTv']
};

export const availsListFrance: AvailsFilter = {
  duration: {
    from: new Date('01/01/2028'),
    to: new Date('06/30/2030'),
  },
  exclusive: false,
  territories: ['france'],
  medias: ['inflight']
};

export const availsListGermanyRussiaCzech: AvailsFilter = {
  duration: {
    from: new Date('01/01/2033'),
    to: new Date('06/30/2033'),
  },
  exclusive: true,
  territories: ['germany', 'russia', 'czech'],
  medias: ['freeTv']
};

export const availsListOngoingSalesExclusive: AvailsFilter = {
  duration: {
    from: new Date('01/01/2029'),
    to: new Date('06/30/2031'),
  },
  exclusive: true,
  territories: ['germany', 'russia', 'czech'],
  medias: ['freeTv']
};

export const availsListOngoingSalesNonExclusive: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2022'),
  },
  exclusive: false,
  territories: ['germany', 'russia', 'czech'],
  medias: ['freeTv']
};

export const availsListGermanyRussiaCzechExclusive: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2022'),
  },
  exclusive: true,
  territories: ['germany', 'russia', 'czech'],
  medias: ['freeTv']
};

export const availsListArgentinaSVod: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2022'),
  },
  exclusive: true,
  territories: ['argentina'],
  medias: ['sVod']
};

export const availsListArgentinaPayTV: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2022'),
  },
  exclusive: true,
  territories: ['argentina'],
  medias: ['payTv']
};

export const availsListGermany: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2022'),
  },
  exclusive: false,
  territories: ['germany'],
  medias: ['freeTv']
};

export const availsListCanada: AvailsFilter = {
  duration: {
    from: new Date('01/01/2022'),
    to: new Date('06/30/2022'),
  },
  exclusive: true,
  territories: ['canada'],
  medias: ['freeTv']
};

export const availsPayTV: AvailsFilter = {
  duration: {
    from: new Date('02/28/2022'),
    to: new Date('02/23/2023'),
  },
  exclusive: true,
  territories: [],
  medias: ['payTv']
};

export const availsInflight: AvailsFilter = {
  duration: {
    from: new Date('02/28/2022'),
    to: new Date('02/23/2023'),
  },
  exclusive: true,
  territories: [],
  medias: ['inflight']
};


export const availsBrewster1: AvailsFilter = {
  duration: {
    from: new Date(),
    to: new Date(),
  },
  exclusive: true,
  territories: ['france', 'china'],
  medias: ['inflight']
};

export const availsBrewster2: AvailsFilter = {
  duration: {
    from: new Date(),
    to: new Date(),
  },
  exclusive: false,
  territories: Europe,
  medias: ['aVod', 'fVod', 'nVod', 'sVod']
};

export const availsBrewster3: AvailsFilter = {
  duration: {
    from: new Date(),
    to: new Date(),
  },
  exclusive: true,
  territories: Europe,
  medias: ['aVod', 'fVod', 'nVod', 'sVod']
};

export const availsBrewster4: AvailsFilter = {
  duration: {
    from: new Date(),
    to: new Date(),
  },
  exclusive: true,
  territories: ['france', 'china'],
  medias: ['inflight', 'payTv']
};
