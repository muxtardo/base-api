import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator';

export function NotExists(
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

@ValidatorConstraint({ name: 'notExists', async: true })
export class ExistsConstraint implements ValidatorConstraintInterface {
	validate(value: string | number, args: ValidationArguments) {
		const [ entity, column ] = args.constraints;
		return entity.countBy({ [column]: value });
	}

	defaultMessage(args: ValidationArguments) {
		const [ entity, column ] = args.constraints;
		return `${column} with value ${args.value} not exists in ${entity.name}`;
	}
}
