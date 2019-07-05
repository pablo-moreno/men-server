function BaseException(message) {
  this.name = 'BaseException'
  this.message = message
  this.stack = (new Error()).stack
  this.status = 500
}
BaseException.prototype = Object.create(Error.prototype)
BaseException.prototype.constructor = BaseException

function BadRequestException(message) {
  this.name = 'BadRequestException'
  this.message = message
  this.status = 400
}
BadRequestException.prototype = Object.create(BaseException.prototype)
BadRequestException.prototype.constructor = BadRequestException

function UnauthorizedException(message) {
  this.name = 'UnauthorizedException'
  this.message = message
  this.status = 401
}
UnauthorizedException.prototype = Object.create(BaseException.prototype)
UnauthorizedException.prototype.constructor = UnauthorizedException

function ForbiddenException(message) {
  this.name = 'ForbiddenException'
  this.message = message
  this.status = 403
}
ForbiddenException.prototype = Object.create(BaseException.prototype)
ForbiddenException.prototype.constructor = ForbiddenException


function NotFoundException(message) {
  this.name = 'NotFoundException'
  this.message = message
  this.status = 404
}
NotFoundException.prototype = Object.create(BaseException.prototype)
NotFoundException.prototype.constructor = NotFoundException

export {
  BaseException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
}
