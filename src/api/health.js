// ====================================== 健康检测：校验服务是否可用 ======================================

const check = async (ctx) => {
  try {
    ctx.state.ok({
      message: 'ok',
    });
  } catch (error) {
    ctx.state.error(error);
  }
};

module.exports = {
  check,
};
