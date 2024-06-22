import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Company, FreshDeskContactPayload, FreshDeskContactResponse } from "../../data_transfer_objs/consume/freshdesk.contact.dto";

const FRESHDESK_TRAILING_DOMAIN = 'freshdesk.com';
const FRESHDESK_CONTACTS_ENDPOINT = '/api/v2/contacts';
const FRESHDESK_COMPANY_ENDPOINT = '/api/v2/companies'

@Injectable()
export class FreshDeskService {

    private readonly logger = new Logger(FreshDeskService.name);

    private readonly authHeaders = {
        Authorization: `Basic ${Buffer.from(process.env.FRESHDESK_TOKEN).toString('base64')}`,
        //'Content-Type': 'application/json'
    }

    constructor(private readonly httpService: HttpService) { }

    // Other existing methods...

    public async validateFreshdeskOrg(freshdeskOrg: string): Promise<void> {
        try {
            await this.seachCompanyByName(freshdeskOrg, 'test');
        } catch (e) {
            if (e.response.status == 404) {
                throw new HttpException(`Invalid Freshdesk Organization ${freshdeskOrg}`, 404);
            } else {
                throw new HttpException(`Unable to reach freshdesk api`, 500);
            }
        }
    }

    public async createContact(freshdeskOrg: string, payload: FormData): Promise<FreshDeskContactResponse> {
        try {
            const { data } = await firstValueFrom(
                this.httpService.post<FreshDeskContactResponse>(
                    `https://${freshdeskOrg}.${FRESHDESK_TRAILING_DOMAIN}${FRESHDESK_CONTACTS_ENDPOINT}`,
                    payload, {
                    headers: {
                        ...this.authHeaders,
                        'Content-Type': 'multipart/form-data',
                    }
                })
            );
            return data;
        } catch (error) {
            throw new HttpException(
                error.message || 'Unknown error',
                error.response?.status || 500
            );
        }
    }

    public async searchContact(freshdeskOrg: string, contactExternalId: string, deleted: boolean): Promise<FreshDeskContactResponse[]> {
        try {
            let basePath = `https://${freshdeskOrg}.${FRESHDESK_TRAILING_DOMAIN}${FRESHDESK_CONTACTS_ENDPOINT}?unique_external_id=${contactExternalId}`;
            if (deleted) basePath += '&state=deleted';
            const { data } = await firstValueFrom(
                this.httpService.get<FreshDeskContactResponse[]>(
                    basePath,
                    {
                        headers: {
                            ...this.authHeaders,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                )
            );
            return data;
        } catch (e) {
            throw new HttpException(
                e.message || 'Unknown error',
                e.response?.status || 500
            );
        }
    }


    public async updateContact(freshdeskOrg: string, id: number, bodyFormData: FormData) {
        try {
            const { data } = await firstValueFrom(this.httpService.put<FreshDeskContactResponse>(
                `https://${freshdeskOrg}.${FRESHDESK_TRAILING_DOMAIN}${FRESHDESK_CONTACTS_ENDPOINT}/${id}`,
                bodyFormData,
                { headers: this.authHeaders }));
            return data;
        } catch (error) {
            throw new HttpException(
                error.message || 'Unknown error',
                error.response?.status || 500
            );
        }
    }

    public async seachCompanyByName(freshdeskOrg: string, companyName: string) {
        const { data } = await firstValueFrom(this.httpService.get<{ companies: Company[] }>(
            `https://${freshdeskOrg}.${FRESHDESK_TRAILING_DOMAIN}${FRESHDESK_COMPANY_ENDPOINT}/autocomplete?name=${companyName}`,
            { headers: this.authHeaders }));
        return data;
    }

    public async createCompany(freshdeskOrg: string, company) {
        try {
            const { data } = await firstValueFrom(this.httpService.post<Company>(
                `https://${freshdeskOrg}.${FRESHDESK_TRAILING_DOMAIN}${FRESHDESK_COMPANY_ENDPOINT}`,
                company, { headers: this.authHeaders }));
            return data;

        } catch (error) {
            throw new HttpException(
                error.message || 'Unknown error',
                error.response?.status || 500
            );
        }

    }
}