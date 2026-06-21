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
}

export {}