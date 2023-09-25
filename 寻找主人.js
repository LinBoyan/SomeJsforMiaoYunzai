import plugin from '../../lib/plugins/plugin.js';
import Cfg from '../../lib/config/config.js';
let MasterID = [-1]//在[]内填入需要通知的QQ,填-1自动识别主人
export class FindMaster extends plugin {
    constructor() {
        super({
            //后端信息
            name: '寻找主人',//插件名字，可以随便写
            dsc: '帮助迷路的机器人寻找失踪的主人&&帮助hentai主人宣示主权',//插件介绍，可以随便写
            event: 'message',//这个直接复制即可，别乱改
            priority: 2000,//执行优先级：数值越低越6
            rule: [
                {
                    //正则表达式
                    reg: '主人',
                    //函数
                    fnc: 'FindMaster'
                }
            ]
        })
    };

    //函数
    async FindMaster(e) {
        //发送消息
        if (e.atBot || e.hasAlias){
            if(MasterID[0] == -1)
                for (let i = 0; i < Cfg.masterQQ.length; i++)
                    e.reply([
                        segment.at(+Cfg.masterQQ[i]),
                        segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${Cfg.masterQQ[i]}&spec=640&img_type=jpg`),
                        "\n主人快来！"])
            else
                for (let i = 0; i < MasterID.length; i++)
                    e.reply([
                    segment.at(+MasterID[i]),
                    segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${MasterID[i]}&spec=640&img_type=jpg`),
                    "\n主人快来！"])
        return true;}
    }
}
