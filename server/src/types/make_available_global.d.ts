import { 
  Request as ExpressRequest, 
  Response as ExpressResponse, 
  NextFunction as ExpressNextFunction 
} from 'express'
import type { AuthSchemaType as ImportedAuthSchemaType } from './auth.type.ts'

declare global {
  type Req = ExpressRequest
  type Res = ExpressResponse
  type Nex = ExpressNextFunction
  
  namespace AppType {
    type AuthSchemaType=ImportedAuthSchemaType
  }
  namespace Express{
    interface Request{
      user?:{
        userId:string;
        tokenId:string;
        role?:string;
        workspaceId?:string
      }
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

export {}