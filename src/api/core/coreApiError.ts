import { ResultCode } from '@/api/core/common'

class CoreApiError extends Error {
  public code: ResultCode
  public requestId?: string

  constructor(message: string, code: ResultCode, requestId?: string) {
    super(message)
    this.code = code
    this.requestId = requestId

    Object.setPrototypeOf(this, CoreApiError.prototype)
  }

  context() {
    return { requestId: this.requestId }
  }
}

export default CoreApiError
