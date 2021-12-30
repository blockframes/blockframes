import { AvailsFilter } from "../avails";

export const availDetailsExclusive: AvailsFilter = {
  duration: {
    from: new Date('06/01/2021'),
    to: new Date('12/01/2021'),
  },
  exclusive: true,
  territories: [],
  medias: ['theatrical']
};

export const availDetailsNonExclusive: AvailsFilter = {
  duration: {
    from: new Date('06/01/2021'),
    to: new Date('12/01/2021'),
  },
  exclusive: false,
  territories: [],
  medias: ['theatrical']
};
