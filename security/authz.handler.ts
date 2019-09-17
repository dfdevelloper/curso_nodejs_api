import * as restify from 'restify'
import {ForbiddenError} from 'restify-errors'

export const authorize: (...profiles: string[])=> restify.RequestHandler = (...profiles)=>{
  return (req, resp, next)=>{
    if(req.authenticated !== undefined && req.authenticated.hasAny(...profiles)){
      console.log('req ', req.authenticated)
      next()
    } else {
      console.log('req ruim', req.authenticated)
      next(new ForbiddenError('Permission denied'))
    }
  }
}
