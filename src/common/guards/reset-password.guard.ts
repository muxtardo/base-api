import { AuthGuard as NestAuthGuard } from '@nestjs/passport'
export const ResetPasswordGuard = NestAuthGuard('reset-password');
