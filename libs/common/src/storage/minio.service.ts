import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { BufferedFile } from './file.model';
import * as crypto from 'crypto';

@Injectable()
export class MinioService {
    private readonly logger = new Logger(MinioService.name);
    private readonly minioClient: Minio.Client;
    private readonly bucketName: string;

    constructor(private readonly configService: ConfigService) {
        const endPoint = this.configService.get<string>('MINIO_ENDPOINT') ?? 'localhost';
        const port = this.configService.get<number>('MINIO_PORT') ?? 9000;
        const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY') ?? 'minioadmin';
        const secretKey = this.configService.get<string>('MINIO_SECRET_KEY') ?? 'minioadmin';
        
        this.minioClient = new Minio.Client({
            endPoint,
            port,
            useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
            accessKey,
            secretKey,
        });

        this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') ?? 'user-documents';
    }

    async onModuleInit() {
        await this.initBucket();
    }

    private async initBucket(): Promise<void> {
        const bucketExists = await this.minioClient.bucketExists(this.bucketName);
        if (!bucketExists) {
            await this.minioClient.makeBucket(this.bucketName);
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${this.bucketName}/*`],
                        Condition: {
                            StringEquals: {
                                's3:ExistingObjectTag/public': 'true'
                            }
                        }
                    }
                ]
            };
            await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        }
    }

    private generateFileName(file: BufferedFile): string {
        const timestamp = Date.now();
        const hashedFileName = crypto
            .createHash('md5')
            .update(`${file.originalname}${timestamp}`)
            .digest('hex');
        const fileExtension = file.originalname.split('.').pop();
        return `${hashedFileName}.${fileExtension}`;
    }

    private async validateFile(file: BufferedFile): Promise<void> {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('File size too large');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type');
        }
    }

    async upload(file: BufferedFile, folder: string): Promise<string> {
        try {
            await this.validateFile(file);
            
            const fileName = this.generateFileName(file);
            const filePath = `${folder}/${fileName}`;

            const metadata = {
                'Content-Type': file.mimetype,
                'Original-Name': file.originalname,
                'Upload-Date': new Date().toISOString(),
            };
            
            await this.minioClient.putObject(
                this.bucketName,
                filePath,
                file.buffer,
                file.size,
                metadata
            );

            // Generate presigned URL (valid for 1 hour)
            const presignedUrl = await this.minioClient.presignedGetObject(
                this.bucketName,
                filePath,
                3600
            );

            return presignedUrl;
        } catch (error) {
            this.logger.error(`Failed to upload file: ${error.message}`);
            throw new Error('Failed to upload file');
        }
    }
} 