import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

@Injectable()
export class GithubService {
	constructor(
		private readonly configService: ConfigService,
	) {}

	validateSign(signature: string, payload: string) {
		const hmac = createHmac("sha1", this.configService.get('GITHUB_SECRET'))
			.update(JSON.stringify(payload))
			.digest("hex");
		return signature === `sha1=${hmac}`;
	}
}
