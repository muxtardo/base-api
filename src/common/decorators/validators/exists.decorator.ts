import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator';

export function Exists(
	entity: any,
	column: string,
	validationOptions?: ValidationOptions
) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [entity, column],
            validator: ExistsConstraint,
        });
    };
}

@ValidatorConstraint({ name: 'exists', async: true })
export class ExistsConstraint implements ValidatorConstraintInterface {
	async validate(value: string | number, args: ValidationArguments) {
		const [ entity, column ] = args.constraints;
		const result = await entity.countBy({ [column]: value });
		return !result;
	}

	defaultMessage(args: ValidationArguments) {
		const [ entity, column ] = args.constraints;
		return `${column} with value ${args.value} already exists in ${entity.name}`;
	}
}
