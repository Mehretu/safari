import { Injectable, Logger } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { AbstractRepository } from "libs/common/src/database/abstract.repository";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UserRepository extends AbstractRepository<User> {
    protected readonly logger = new Logger(UserRepository.name);

    constructor(dataSource: DataSource) {
        super(dataSource.getRepository(User));
    }
}