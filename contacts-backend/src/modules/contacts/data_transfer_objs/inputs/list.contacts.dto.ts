export class ListContacts {
    registered?: WhenRegisterFilter = WhenRegisterFilter.All;
    page: number = 1;
}

export enum WhenRegisterFilter {
    All = "ALL",
    Today = "Today",
    Yesterday = "Yesterday",
    ThisWeek = "ThisWeek"
  }