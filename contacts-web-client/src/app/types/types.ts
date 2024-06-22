export interface Contact {
    id: string;
    name: string;
    email: string;
    githubUser: string;
    gitHubId: number;
    freshdeskId: number;
    creatorId: string;
    registered: Date;
}

export type PaginationResult<T> = {

    first: number;

    last: number;

    limit: number;

    total: number;

    data: T[];
}

export interface Credentials {
    username?: string;
    password?: string;
  }


export interface User {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
}