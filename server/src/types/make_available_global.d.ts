import { 
  Request as ExpressRequest, 
  Response as ExpressResponse, 
  NextFunction as ExpressNextFunction 
} from 'express'

declare global {
  type Req = ExpressRequest
  type Res = ExpressResponse
  type Nex = ExpressNextFunction
  
  namespace AppType {
    
  }
  namespace Express{
    interface Request{
      user?:{
        id:string;
        role:string;
        workspaceId?:string

      }
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

export {}