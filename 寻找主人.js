import Cfg from '../../lib/config/config.js';
export class find_Master extends plugin {
    constructor() {
        super({
            name: '找主人',
            dsc: '帮走丢的机器人找到回家的路',
            event: 'message',
            priority: -1000,
            rule: [
                {
                    reg: '^你主人是谁$',
                    fnc: 'like'
                }
            ]
        })
    }
    async like(e) {
        const msg = []
        msg.push(`我的主人是`)
        //普通qq机器人
        if(typeof e.user_id === "number")
            for(let i=0;i<Cfg.masterQQ.length;i++)
                if(typeof Cfg.masterQQ[i] === "number")
                    msg.push(segment.at(+Cfg.masterQQ[i]));
                else;
        //PC微信
        else if(e.user_id.match(/wxid_/))
            for(let i=0;i<Cfg.masterQQ.length;i++)
                    if(typeof Cfg.masterQQ[i] === "string" && Cfg.masterQQ[i].match(/wxid_/))
                        msg.push(segment.at(Cfg.masterQQ[i]));
                    else;
        //QQ频道Bot
        else if(e.user_id.match(/qg_/))
            for(let i=0;i<Cfg.masterQQ.length;i++)
                if(typeof Cfg.masterQQ[i] === "string" && Cfg.masterQQ[i].match(/qg_/))
                    msg.push(segment.at(Cfg.masterQQ[i]));
                else;
        else;
        if(msg == `我的主人是`)
            await this.reply("暂无主人或不支持的适配器")
        else
            await this.reply(msg)
        return;
    }
}
