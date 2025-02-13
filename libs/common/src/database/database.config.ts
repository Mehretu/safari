import { ConfigService } from "@nestjs/config";
import { User } from "@app/auth/users/entities/user.entity";
import { DataSource } from "typeorm";


export const createDataSource = (configService: ConfigService) => {

    return new DataSource({
        type: 'mongodb',
        url: configService.get('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        entities: [User],
        synchronize: true,
    });
};