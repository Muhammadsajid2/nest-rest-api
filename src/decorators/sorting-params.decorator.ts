import { BadRequestException, ExecutionContext, createParamDecorator } from '@nestjs/common'
import { Request } from 'express'

export const SortingParams = createParamDecorator((_data: any, ctx: ExecutionContext): string => {
  const req: Request = ctx.switchToHttp().getRequest()
  const sort = (req.query.sort as string) || 'createdAt:-1'

  const sortPattern = /^([a-zA-Z0-9]+:[0-9]+, )*([a-zA-Z0-9]+:[-0-9]+)$/
  if (!sort.match(sortPattern)) throw new BadRequestException('Invalid sort parameter')

  return sort
})
