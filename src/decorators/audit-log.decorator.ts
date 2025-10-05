import { SetMetadata } from '@nestjs/common'

import { AUDIT_LOG_DATA } from 'src/constants/audit-log.constant'

/**
 *
 * @param value name of the log
 * @returns
 */
export const AuditLog = (name: string) => SetMetadata(AUDIT_LOG_DATA, name)
