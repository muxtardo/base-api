import { Transform } from "class-transformer";
import { IsNumber, IsOptional, Max, Min } from "class-validator";
import { ISearchFilter } from "../interfaces/search-filter.interface";

export class SearchDto {
	@IsOptional()
	@IsNumber({}, { message: 'Page must be a number' })
	@Min(1, { message: 'Page must be greater than 0' })
	@Transform(({ value }) => Number(value))
	page?: number;

	@IsOptional()
	@IsNumber({}, { message: 'Limit must be a number'})
	@Min(10, { message: 'Limit must be greater than 10' })
	@Max(50, { message: 'Limit must be less than 50' })
	@Transform(({ value }) => Number(value))
	limit?: number;

	@IsOptional()
	filter?: ISearchFilter;

	@IsOptional()
	relations?: string[];
}
