import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import { AbstractEntity } from "./abstract.schema";
import { Logger, NotFoundException } from "@nestjs/common";

export abstract class AbstractRepository<T extends AbstractEntity> {
    protected abstract readonly logger: Logger;

    constructor (protected readonly repository: Repository<T>) {}

    async create(document: DeepPartial<T>): Promise<T> {
        const createdDocument = this.repository.create(document);
        return this.repository.save(createdDocument);
    }

    async findOne(
        filterQuery: FindOptionsWhere<T>,
        options: {throwNotFoundException?: boolean} = {throwNotFoundException: true}
    ): Promise<T | null> {
        const document = await this.repository.findOne({
            where: filterQuery
        })

        if (!document && options.throwNotFoundException) {
            this.logger.warn('Document was not found with filterQuery', filterQuery);
            throw new NotFoundException('Document not found');
        }

        return document;
    }

    async findOneAndUpdate(
        filterQuery: FindOptionsWhere<T>,
        update: DeepPartial<T>
    ): Promise<T> {
        const document = await this.repository.findOne({
            where: filterQuery
        })
        if(!document) {
            this.logger.warn('Document was not found with filterQuery', filterQuery);
            throw new NotFoundException('Document not found');
        }

        Object.assign(document, update);
        return this.repository.save(document);
    }

    async find(filterQuery: FindOptionsWhere<T>): Promise<T[]> {
        return this.repository.find({
            where: filterQuery
        })
    }

    async findOneAndDelete(filterQuery: FindOptionsWhere<T>): Promise<T> {
        const document = await this.repository.findOne({
            where: filterQuery
        })

        if(!document) {
            this.logger.warn('Document was not found with filterQuery', filterQuery);
            throw new NotFoundException('Document not found');
        }

        return this.repository.remove(document);
    }
}