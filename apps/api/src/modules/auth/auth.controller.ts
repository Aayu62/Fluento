import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RegisterSchema, LoginSchema, type RegisterDto, type LoginDto } from '@fluento/shared';

class RefreshTokenBody {
  refreshToken!: string;
}

class SyncAuthBody {
  accessToken!: string;
}

class ForgotPasswordBody {
  email!: string;
}

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'Account created and access token returned' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  register(@Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Access token returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() body: RefreshTokenBody) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and invalidate session' })
  logout(@Headers('authorization') authHeader: string) {
    const token = authHeader.slice(7);
    return this.authService.logout(token);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Send password reset email' })
  forgotPassword(@Body() body: ForgotPasswordBody) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync OAuth user with backend' })
  sync(@Body() body: SyncAuthBody) {
    return this.authService.syncOAuthUser(body.accessToken);
  }
}
