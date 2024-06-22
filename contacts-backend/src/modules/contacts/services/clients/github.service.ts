import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { AxiosError } from "axios";
import { catchError, firstValueFrom } from "rxjs";
import { GitHubUser } from "../../data_transfer_objs/consume/github.user.dto";

const GITHUB_BASE_URL = 'https://api.github.com';
const GET_USER_ENDPOINT = GITHUB_BASE_URL + '/users';

@Injectable()
export class GitHubService {

    private readonly authHeather = {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
    }

    constructor(private readonly httpService: HttpService) { }

    public async getUserDataByName(username: string): Promise<GitHubUser> {

        const { data } = await firstValueFrom(
            this.httpService.get<GitHubUser>(`${GET_USER_ENDPOINT}/${username}`, {
                headers: this.authHeather
            })
        ).catch((e: AxiosError) => {
            if (e.response.status === 404) {
                throw new NotFoundException(`Unable to find user on github`);
            }
            else {
                throw new HttpException(`Error consuming gitup`, 500);
            }
        });
        return data;

    }
}