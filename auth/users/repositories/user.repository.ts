import { Injectable, Logger } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { AbstractRepository } from "libs/common/src/abstract.repository";
import { Repository } from "typeorm";



@Injectable()
export class UserRepository  extends AbstractRepository<User> {
    protected readonly logger = new Logger(UserRepository.name);

    constructor(
        userRepository: Repository<User>)
         {
        super(userRepository);
    }

}

   
