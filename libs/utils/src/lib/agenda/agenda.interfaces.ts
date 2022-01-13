export interface IcsEvent {
  id: string,
  title: string,
  start: Date,
  end: Date,
  description: string,
  organizer: {
    name: string,
    email: string
  }
}