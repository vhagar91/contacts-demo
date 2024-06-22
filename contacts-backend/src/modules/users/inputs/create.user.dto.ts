import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, Length} from "class-validator";

export class CreateUserDto {
    @Length(5)
    @ApiProperty()
    username: string;
    @Length(8)
    @ApiProperty()
    password: string;
    @Length(5)
    @ApiProperty()
    firstName: string;
    @Length(5)
    @ApiProperty()
    lastName: string;
    @IsEmail()
    @ApiProperty()
    email: string;
}