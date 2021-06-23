export interface User {
  uid: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Organization {
  id: string;
  email: string;
  address: Location;
  denomination: {
    full: string;
    public: string;
  }
  activity: string;
  fiscalNumber: string;
}

export interface Location {
  street: string;
  zipCode: string;
  city: string;
  country: string;
  phoneNumber?: string;
}

export interface Dates {
  from: string;
  to: string;
}

export interface Movie {
  id: string;
  title: {
    international: string
  }
}

export interface Screening {
  event: string;
  movie: Partial<Movie>;
  by: Partial<User>;
  org: Partial<Organization>;
  invitees: Partial<User>[];
  private: boolean;
}

export interface Avails {
  territories: string[],
  from: {
    year: number,
    month: string,
    day: number
  },
  to: {
    year: number,
    month: string,
    day: number
  },
  medias: string[],
  exclusive: boolean
}

export interface Currency {
  label: string,
  value: string
}
