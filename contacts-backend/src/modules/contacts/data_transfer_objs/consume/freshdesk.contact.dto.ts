interface OtherCompany {
    company_id: number;
    view_all_tickets: boolean;
}

export interface Company {
    id: number;
    name: string;
}


export class FreshDeskContactResponse {
    active: boolean;
    address: string | null;
    company_id: number;
    view_all_tickets: boolean;
    deleted: boolean;
    description: string | null;
    email: string;
    id: number;
    job_title: string | null;
    language: string;
    mobile: string | null;
    name: string;
    phone: string | null;
    time_zone: string;
    twitter_id: string | null;
    other_emails: string[];
    other_companies: OtherCompany[];
    created_at: string;
    updated_at: string;
    tags: string[];
    avatar: string | null;

    constructor(partial: Partial<FreshDeskContactResponse>) {
        Object.assign(this, partial);
    }
}

export interface FreshDeskContactPayload {
    address: string;
    company_id: number;
    description: string;
    email: string;
    name: string;
    unique_external_id: string;
    twitter_id: string;
    avatar?: Blob
}