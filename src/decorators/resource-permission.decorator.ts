// import { SetMetadata } from '@nestjs/common'

// import { AppResources } from 'src/modules/roles-permissions/models/role-permissions.model'

// export const RESOURCE_PERMISSION_KEY = 'resourcePermission'
// const scopes = {
//   create: 'create',
//   read: 'read',
//   update: 'update',
//   delete: 'delete',
// } as const

// export interface IResourcePermission {
//   resource: keyof typeof AppResources
//   scope: keyof typeof scopes
// }

// export const ResourcePermission = (data: IResourcePermission) => SetMetadata(RESOURCE_PERMISSION_KEY, data)
