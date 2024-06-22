import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty} from "class-validator";

export class CreateContactDto {
    @ApiProperty()
    @IsNotEmpty()
    github_username: string;
    @ApiProperty()
    @IsNotEmpty()
    fresdesk_subdomain: string;
}