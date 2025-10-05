import { SetMetadata } from '@nestjs/common'

/**
 * Decorator that marks a route to skip email verification check
 */
export const SkipEmailVerification = () => SetMetadata('skipEmailVerification', true)
