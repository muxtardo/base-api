import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator';

export function IsDocument(
	validationOptions?: ValidationOptions
) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsDocumentConstraint,
        });
    };
}

@ValidatorConstraint({ name: 'document', async: true })
export class IsDocumentConstraint implements ValidatorConstraintInterface {
	async validate(value: string | number, args: ValidationArguments) {
		return !this.validateDocument(value);
	}

	defaultMessage(args: ValidationArguments) {
		return `${this.documentType(args.value)} is invalid`;
	}

	private documentType(document: string) {
		if (document.length === 11) return 'CPF';
		else if (document.length === 14) return 'CNPJ';
		else return 'Document';
	}

	private validateDocument(value: string | number) {
		const document = String(value).replace(/\D/g, '');

		const length = document.length;
		if (length === 11) return this.validateCPF(document);
		else if (length === 14) return this.validateCNPJ(document);
		else return false;
	}

	private validateCPF(document: string) {
		// Validar se tem 11 caracteres ou se é uma sequência de digitos repetidos
		if (document.length !== 11 || document.match(/(\d)\1{10}/)) return false;

		const cpf: number[] = document.split('').map(el => +el);
		const rest = (count: any): number => (
			cpf.slice(0, count-12)
				.reduce((soma, el, index) => (soma + el * (count - index)), 0) * 10
		) % 11 % 10;

		return rest(10) === cpf[9] && rest(11) === cpf[10];
	}

	private validateCNPJ(document: string) {
		// Validar se tem 14 caracteres ou se é uma sequência de digitos repetidos
		if (document.length !== 14 || document.match(/(\d)\1{13}/)) return false;

		const cnpj: number[] = document.split('').map(el => +el);
		const rest = (count: any): number => (
			cnpj.slice(0, count-13)
				.reduce((soma, el, index) => (soma + el * (count - index)), 0) % 11
		) % 10;

		return rest(13) === cnpj[12] && rest(14) === cnpj[13];
	}
}
