import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(LocalStrategy.name);

    constructor(private readonly authService: AuthService) {
        super();
    }

    public async validate(username: string, password: string): Promise<User> {
        this.logger.debug(`Validating user ${username}`);
        const userName = username.toLowerCase();
        
        const user = await this.authService.validateUser(userName, password);
        return user;
    }
}