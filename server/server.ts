import * as restify from 'restify';
import * as mongoose from 'mongoose';
import { environment } from '../commons/environment'
import { Router } from '../commons/router'
import { mergePatchBodyParser } from "./merge-patch.parser"
import { handleError } from './error.handler'
import { tokenParser } from '../security/token.parser'

export class Server {
    application: restify.Server

    initializeDB(): Promise<any> {
        (<any>mongoose).Promise = global.Promise
        return mongoose.connect(environment.db.url, {
            useMongoClient: true
        })
    }

    initRoutes(routers: Router[]): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.application = restify.createServer({
                    name: 'meat-api',
                    version: '1.0.0'
                })

                //register plugins
                this.application.use(restify.plugins.queryParser())
                this.application.use(restify.plugins.bodyParser())
                this.application.use(mergePatchBodyParser)
                this.application.use(tokenParser)
                
                //apply each route
                routers.forEach(router => router.applyRoutes(this.application))

                //start server
                this.application.listen(environment.server.port, () => resolve(this.application))


                //error handler
                this.application.on('restifyError', handleError)

            } catch (error) {
                reject(error)
            }
        })
    }

    bootstrap(routers: Router[] = []): Promise<Server> {
        return this.initializeDB().then(() => this.initRoutes(routers).then(() => this))
    }

    shutdown() {
        return mongoose.disconnect().then(() => this.application.close())
    }
}