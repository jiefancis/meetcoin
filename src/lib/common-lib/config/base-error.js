class BaseError extends Error {
  /**
   * nxg通用error类
   * @param biz {{code:number, msg:string}|number}
   * @param err_msg: string
   */
  constructor(biz, err_msg = '') {
    super(err_msg);
    this.code = typeof biz === 'number' ? biz : biz.code;
    this.err_msg = err_msg || (typeof biz === 'number' ? '' : biz.msg);
  }
}

module.exports = BaseError;
