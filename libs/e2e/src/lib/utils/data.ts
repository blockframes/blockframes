import { Material } from "./type";

export const MATERIALS: Material[] = [
  {
    title: 'First Material Value',
    description: 'First Material Description',
    step: {
      name: 'First step',
      date: '11/20/2019'
    },
    category: 'Category#1',
    price: '2000',
    currency: 'EUR'
  },
  {
    title: 'Second Material Value',
    description: 'Second Material Description',
    step: {
      name: 'Second step',
      date: '12/25/2019'
    },
    category: 'Category#2',
    price: '980',
    currency: 'USD'
  },
  {
    title: 'Third Material Value',
    description: 'Third Material Description',
    step: {
      name: 'First step',
      date: '11/20/2019'
    },
    category: 'Category#3',
    price: '3400',
    currency: 'JPY'
  }
];

export const UPDATED_MATERIALS: Material[] = [
  {
    title: 'First Updated Material Value',
    description: 'First Updated Material Description',
    step: {
      name: 'Second step',
      date: '12/25/2019'
    },
    category: 'Category#2',
    price: '4000',
    currency: 'CAD'
  },
  {
    title: 'Second Updated Material Value',
    description: 'Second Updated Material Description',
    step: {
      name: 'First step',
      date: '11/20/2019'
    },
    category: 'Category#3',
    price: '1960',
    currency: 'GBP'
  },
  {
    title: 'Third Updated Material Value',
    description: 'Third Updated Material Description',
    step: {
      name: 'Second step',
      date: '12/25/2019'
    },
    category: 'Category#1',
    price: '6800',
    currency: 'NZD'
  }
];

export const enum Statuses {
  ORDERED = 'Ordered',
  PAID = 'Paid',
  PENDING = 'Pending',
  AVAILABLE = 'Available',
  DELIVERED = 'Delivered'
}
