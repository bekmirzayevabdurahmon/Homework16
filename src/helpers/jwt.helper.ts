import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, JwtSignOptions, TokenExpiredError } from '@nestjs/jwt';
import { UserRoles } from 'src/modules';

@Injectable()
export class JwtHelper {
  constructor(private jwt: JwtService) {}

  async generateToken(payload: { id: number; role: UserRoles }): Promise<{ token: string }> {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new InternalServerErrorException('ACCESS_TOKEN_SECRET topilmadi');
    }

    const expiresIn = process.env.ACCESS_TOKEN_TIME;
    if (!expiresIn) {
      throw new InternalServerErrorException('ACCESS_TOKEN_TIME topilmadi');
    }

    const options: JwtSignOptions = {
      secret,
      expiresIn: parseInt(expiresIn, 10), 
    };

    const token = await this.jwt.signAsync(payload, options);
    return { token };
  }
  async verifyToken(token: string) {
    try {
      const decodedData = await this.jwt.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      return decodedData;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ForbiddenException('Token vaqti tugagan');
      }

      if (error instanceof JsonWebTokenError) {
        throw new BadRequestException('Jwt token formati xato ');
      }

      throw new InternalServerErrorException('Server xatosi');
    }
  }
}
