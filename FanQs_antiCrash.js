export class antiCrash extends plugin {
    constructor() {
        super({
            //后端信息
            name: 'antiCrash',//插件名字，可以随便写
            dsc: '拦截和检查FanSky_Qs#队伍伤害 指令',//插件介绍，可以随便写
            event: 'message',//这个直接复制即可，别乱改
            priority: -2000,//执行优先级：数值越低越6
            rule: [
                {
                    //正则表达式
                    reg: '^#队伍伤害(.*)',
                    //函数
                    fnc: 'antiCrash'
                }
            ]
        })
    };

    //函数
    async antiCrash(e) {
        if (!e.msg.match(/\x20/)){
            e.reply("单人识别暂时锁死，请添加空格后再试")
            return true;
        }
        else
            return false;
    }
}