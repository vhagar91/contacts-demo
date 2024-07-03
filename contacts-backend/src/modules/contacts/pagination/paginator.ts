import { Expose } from "class-transformer";
import { SelectQueryBuilder } from "typeorm";

export interface PaginateOptions {
    limit: number;
    currentPage: number;
    total?: boolean;
}

export class PaginationResult<T> {
    constructor(partial: Partial<PaginationResult<T>>) {
        Object.assign(this, partial);
    }
    @Expose()
    first: number;
    @Expose()
    last: number;
    @Expose()
    limit: number;
    @Expose()
    total?: number;
    @Expose()
    data: T[];
}

export async function paginate<T>(qb: SelectQueryBuilder<T>, option: PaginateOptions = {
    limit: 2,
    currentPage: 1
}): Promise<PaginationResult<T>> {

    const offset = (option.currentPage - 1) * option.limit;
    const data = await qb.limit(option.limit).offset(offset).getMany();
    return new PaginationResult({
        first: offset + 1,
        last: offset + data.length,
        limit: option.limit,
        total: option.total ? await qb.getCount() : 0,
        data
    });
}