import { ArgumentsHost, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

function mockHost() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    jest.spyOn(require('@nestjs/common').Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('passes through a plain-string HttpException message', () => {
    const { host, status, json } = mockHost();
    filter.catch(new NotFoundException('Appointment not found'), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ statusCode: 404, message: 'Appointment not found' });
  });

  it('passes through a ConflictException message unchanged', () => {
    const { host, status, json } = mockHost();
    filter.catch(new ConflictException('Email is already registered'), host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({ statusCode: 409, message: 'Email is already registered' });
  });

  it('joins a ValidationPipe-style message array into one string', () => {
    const { host, status, json } = mockHost();
    filter.catch(new BadRequestException(['email must be an email', 'password is too short']), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'email must be an email password is too short',
    });
  });

  it('maps an unexpected non-HttpException error to a safe generic 500', () => {
    const { host, status, json } = mockHost();
    filter.catch(new Error('connection terminated unexpectedly'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Something went wrong on our end. Please try again in a moment.',
    });
  });
});
