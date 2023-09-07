import plugin from "../../lib/plugins/plugin.js";
import common from "../../lib/common/common.js";
export class countdown extends plugin {
    constructor() {
        super({
            name: "countdown",
            dsc: "设置倒计时",
            event: "message",
            priority: 4096,
            rule: [
                {
                    reg: "^#(.*)(小时)?(.*)(分钟)?后叫(我)?(.*)",
                    fnc: "countdown"
                }
            ]
        })
    }
    async call(e,action,signal,qq){
        if(signal)
            await e.reply(`时间到啦！${action}!`, true, { at: true })
        else
            await e.reply([segment.at(+qq),`时间到啦！${action}!`], true)
    }
    async countdown(e){
        let minute = e.msg.match(/\d+分钟/) || 0
        minute = parseInt(minute)

        let hour = e.msg.match(/\d+小时/) || 0
        hour = parseInt(hour)

        let delay = (hour*60 + minute)*60*1000

        let signal = 0
        let action
        if(e.msg.match(/#(.*)(小时)?(.*)(分钟)?后叫我/)){
            signal = 1
            action = e.msg.replace(/#(.*)(小时)?(.*)(分钟)?后叫我/,"")
        }
        else
            action = e.msg.replace(/#(.*)(小时)?(.*)(分钟)?后叫/,"")
        
        let at = e.message.filter(item => item.type == 'at')?.map(item => item?.qq);
        let qq = at[0];

        if(signal)
            await this.e.reply(`好的，${hour}小时${minute}分钟后叫你${action}`, true)
        else
            await this.e.reply([`好的，${hour}小时${minute}分钟后叫`,segment.at(+qq),action], true)
        
        setTimeout(this.call,delay,e,action,signal,qq)
    }
}