const _ = require('lodash');
const { logger } = require('../../lib/common-lib');
const taskService = require('../../service/task-service');
const base = require('./base');
const { TaskConfig } = require("../../config/constants");

async function GetSignTask(ctx){
  try {
    const userId = ctx.currentUserId;
    const nowDate = base.GetNowDate(ctx.headers['timezone']);
    const { current_day, items } = await taskService.GetSignStatus(userId, nowDate);
    ctx.state.ok({
      current_day,
      items,
    });
  } catch (error){
    ctx.state.error(error);
  }
}

async function UpdateSignTask(ctx){
  try {
    const userId = ctx.currentUserId;
    const options = base.GetOptions(ctx);
    const nowDate = base.GetNowDate(ctx.headers['timezone']);
    const {current_day, reward} = await taskService.SignReward(userId, nowDate, options);

    ctx.state.ok({
      current_day:current_day,
      reward: reward,
    });
  } catch (error){
    ctx.state.error(error);
  }
}


async function MysteryBox(ctx){
  try {
    const userId = ctx.currentUserId;
    const items = await taskService.MysteryBox(userId);
    ctx.state.ok({ items });
  } catch (error){
    ctx.state.error(error);
  }
}

async function FriendBoostDetail(ctx){
  try {
    const { user_id:userId, box_type:boxType } = ctx.state.params;
    const items = await taskService.MysteryBox(userId);
    ctx.state.ok({items});
  } catch (error) {
    ctx.state.error(error);
  }
}

async function FriendBoost(ctx){
  try {
    //TODO: 可能要改成 snap id
    const { user_id:userId, box_type:boxType } = ctx.state.params;
    const options = base.GetOptions(ctx);
    await taskService.FriendBoost(userId, boxType, options);
    ctx.state.ok({});
  } catch (error) {
    ctx.state.error(error);
  }
}


module.exports = {
  GetSignTask,
  UpdateSignTask,
  MysteryBox,
  FriendBoost,
  FriendBoostDetail,
}
