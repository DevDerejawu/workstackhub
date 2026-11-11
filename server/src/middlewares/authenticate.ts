import { tokenServiceInstance } from "@/utils/token.service.js"; 
  async function authenticate(req:Req, res:Res, next:Nex) {
   const decoded = await tokenServiceInstance.authenticateAndRefresh(
        req.cookies.accessToken,
        req.cookies.refreshToken,
        res,
        req
      );
      req.user = {
        userId: decoded.userId,
        tokenId: decoded.tokenId,
      };
      next();
  }

  export default authenticate
  



