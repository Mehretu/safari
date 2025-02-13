export class VehicleMakeDto{
    id: string;
    name: string;
    country: string;
    logoUrl: string;
}

export class VehicleModelDto{
    id: string;
    name: string;
    availableYears: number[];
    makeId: string;
}