import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const statusCode = res.statusCode;
      const endTime = Date.now();
      const timeTaken = endTime - startTime;

      console.log(
        `${method} ${originalUrl} ${statusCode} ${timeTaken.toFixed(3)} ms`,
      );
    });

    next();
  }
}
