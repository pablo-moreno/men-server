const e = fn => {
  return async (req, res, next) => {
    fn(req, res, next).catch (next)
  }
}

export default class ExpressView {
  method = 'get'
  permissions = []
  middleware = []

  static asView(controller) {
    return [...ExpressView.middleware, ...ExpressView.permissions, e(controller)]
  }
}

class LoginView extends ExpressView {
  permissions = []
  
}


export class Url {
  constructor(path, controller, name, method='GET') {
    this.path = path
    this.controller = controller
    this.name = name
    this.method = method.toLowerCase()
    this.middleware = []
    this.permissions = []
  }

  /**
   * 
   * @param {Express} server 
   * @param {Array<Url>} urls 
   */
  static addUrls(server, urls) {
    this.urls.map(url => {
      server[url.method](...url.middleware, ...url.permissions, e(url.controller))
    })
  }
}