import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export interface IFindByIdQueryParams {
  populate?: string
  populateSelect?: string
}

export const FindByIdQueryParams = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IFindByIdQueryParams => {
    const req: Request = ctx.switchToHttp().getRequest()
    const populate = (req.query.populate as string)?.trim() || ''
    const populateSelect = (req.query.populateSelect as string)?.trim() || ''

    return { populate, populateSelect }
  },
)
