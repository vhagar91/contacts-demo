import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(private readonly usersService: UsersService) { }

    public async validateUser(username: string, password: string): Promise<User> {
        const user = await this.usersService.getUser(username);
        if (!user) {
            throw new UnauthorizedException('Invalid  username');
        }

        if (!(await bcrypt.compare(password, user.password))) {
            this.logger.debug(`invalid password attent ${username}`)
            throw new UnauthorizedException('Invalid Credentials');
        }
        this.logger.debug(`${username} log in`);
        return user;
    }
}