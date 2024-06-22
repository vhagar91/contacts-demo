import { Body, ClassSerializerInterceptor, Controller, Get, HttpException, HttpStatus, Post, Request, SerializeOptions, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './inputs/create.user.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/modules/auth/guards/local.auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { AuthenticatedGuard } from 'src/modules/auth/guards/authenticated.guard';
import { LoginUserDto } from './inputs/login.user.dto';

@Controller({
    path: "users",
    version: '1',
})
@ApiTags('Users')
@SerializeOptions({ strategy: 'excludeAll' })
export class UsersController {

    constructor(private readonly userService: UsersService) {

    }

    @Post('register')
    @UseInterceptors(ClassSerializerInterceptor)
    public async register(@Body() payload: CreateUserDto): Promise<User> {
        const user = new User(payload);
        return new User({
            ...(await this.userService.registerUser(user).catch(err => {
                throw new HttpException({
                    message: err.message
                }, HttpStatus.BAD_REQUEST);
            })),
        });
    }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @ApiBody({ type: LoginUserDto })
    public async login(@CurrentUser() user: User) {
        return {
            user: user.username,
            msg: 'User logged in',
        }
    }


    //Get / logout
    @Get('/validate')
    @UseGuards(AuthenticatedGuard)
    validate(@Request() req, @CurrentUser() user: User): any {
        return {
            user: user.username,
            msg: 'The user session still valid'
        }
    }

    //Get / logout
    @Get('/logout')
    @UseGuards(AuthenticatedGuard)
    logout(@Request() req): any {
        req.session.destroy();
        return { msg: 'The user session has ended ' }
    }
}
