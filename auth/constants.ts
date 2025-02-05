import { SetMetadata } from "@nestjs/common";

export const jwtConstants = {
    secret: 'this is vvssdr18p15 secret key',
};

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

