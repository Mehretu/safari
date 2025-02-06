import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import { createDataSource } from "./database.config";
import { Module } from "@nestjs/common";
import { createInitialAdmin } from "libs/seed/initial-admin.seed";

@Module({
    providers: [
        {
            provide: DataSource,
            useFactory: async(configService: ConfigService) => {
                const dataSource = createDataSource(configService);
                const initializedDataSource = await dataSource.initialize();

                await createInitialAdmin(initializedDataSource);
                return initializedDataSource;
            },
            inject: [ConfigService],
        }
    ],
    exports: [DataSource],
})
export class DatabaseModule {}