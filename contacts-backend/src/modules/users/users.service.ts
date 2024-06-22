import { Injectable, Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) { }

    private async hashPassword(passport: string): Promise<string> {
        return await bcrypt.hash(passport, 10)
    }

    public async getUser(username: string): Promise<User> {
        return await this.userRepo.findOne({
            where: {
                username: username
            }
        })
    }

    public async registerUser(user: User): Promise<User> {
        this.logger.debug(`${new Date().toISOString()} Registering new User ${user.username}`);
        user.password = await this.hashPassword(user.password);

        const registerd = await this.userRepo.save(user);
        this.logger.debug(`User Registerd`);
        return registerd;
    }
}