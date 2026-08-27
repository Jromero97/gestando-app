import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';

/**
 * Normalizes every thrown error into `{ statusCode, message }` with `message`
 * always a single human-readable string - clients can display it directly
 * without knowing about Nest's exception shapes.
 *
 * `HttpException`s (NotFoundException, ConflictException, ValidationPipe's
 * BadRequestException, etc.) are already written to be user-readable, so
 * their message passes through as-is; ValidationPipe's per-field message
 * array is joined into one sentence. Anything else is unexpected (a bug, a
 * DB error nobody translated) - the real cause is logged server-side and the
 * client gets a safe generic message instead of a leaked stack trace.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json({ statusCode: status, message: this.extractMessage(exception) });
      return;
    }

    this.logger.error(exception instanceof Error ? exception.stack : exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong on our end. Please try again in a moment.',
    });
  }

  private extractMessage(exception: HttpException): string {
    const body = exception.getResponse();
    if (typeof body === 'string') return body;
    if (typeof body === 'object' && body !== null && 'message' in body) {
      const message = (body as { message: unknown }).message;
      if (Array.isArray(message)) return message.join(' ');
      if (typeof message === 'string') return message;
    }
    return exception.message;
  }
}
