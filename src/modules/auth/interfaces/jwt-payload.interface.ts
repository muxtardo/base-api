export interface IJwtPayload {
	id: number;
	ip?: string;
	type?: 'user' | 'reset-password';
	token?: string;
}
