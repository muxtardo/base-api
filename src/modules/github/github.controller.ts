import { Body, Controller, Headers, Logger, Post, UnprocessableEntityException } from "@nestjs/common";
import { exec } from "child_process";
import { resolve } from "path";
import { GithubService } from "./github.service";

@Controller('github')
export class GithubController {
	private logger = new Logger(GithubController.name);

	constructor(
		private readonly githubService: GithubService
	) {}

	@Post('webhook')
	async webhook(
		@Body() payload: any,
		@Headers('x-hub-signature') sign: string,
	) {
		const { ref } = payload;
		this.logger.log('Receiving webhook from GitHub...');

		if (!this.githubService.validateSign(sign, payload)) {
			this.logger.error('Invalid signature, skipping...');
			throw new UnprocessableEntityException('Invalid signature!');
		}
		if (!(ref && String(ref).split("/").pop() === "main")) {
			this.logger.log('Invalid branch, skipping...');
			throw new UnprocessableEntityException('Invalid branch!');
		}

		this.logger.log('Valid signature, pulling from GitHub...');
		exec(resolve(__dirname, 'github.sh'), (error, stdout, stderr) => {
			if (error) {
				this.logger.error(`exec error: ${error}`);
				return;
			}
			this.logger.log(`stdout: ${stdout}`);
			this.logger.log(`stderr: ${stderr}`);

			this.logger.log('Restarting server...');
		});

		return { message: 'Pulling from GitHub...' };
	}
}
