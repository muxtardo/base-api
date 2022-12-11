import { Logger } from '@nestjs/common';
import { BaseEntity, CreateDateColumn, FindOptionsWhere, ILike, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BadFilterException } from '../exceptions/filter.exception';
import { ISearchFilter } from '../interfaces/search-filter.interface';

export abstract class AbstractEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@CreateDateColumn()
	createdAt?: Date;

	@UpdateDateColumn()
	updatedAt?: Date;

	static createFilter<T>(filter?: ISearchFilter) {
		return filter && Object.keys(filter).map(field => {
			const hasRelation = field.split('.');
			if (hasRelation.length > 1) {
				const [ relation, field ] = hasRelation;
				return { [relation]: { [field]: isNaN(+filter[field]) ? ILike(`%${filter[field]}%`) : +filter[field] } };
			} else {
				const value = filter[field];
				return { [field]: isNaN(+value) ? ILike(`%${value}%`) : +value };
			}
		}) as FindOptionsWhere<T>[];
	}

	static async pagination<T>(entity: any, page = 1, limit = 10, criteria?: FindOptionsWhere<T> | FindOptionsWhere<T>[], relations?: string[]) {
		// Pagination
		const skipResults: number = limit * (page - 1);

		try {
			// Total pages and items
			const totalItems = await entity.count({ where: criteria });
			const totalPages = Math.ceil(totalItems / limit);

			// Get results
			const results = await entity.find({
				where: criteria,
				relations,
				skip: skipResults,
				take: limit
			});

			return {
				total: totalItems,
				pages: totalPages,
				limit, results
			};
		} catch (error) {
			const logger = new Logger(entity.name);
			logger.error(error);
			throw new BadFilterException('Invalid filter');
		}
	}

	static randomString(length = 8) {
		const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		let result = '';
		for (let i = length; i > 0; --i)
			result += chars[Math.floor(Math.random() * chars.length)];
		return result;
	}
}
