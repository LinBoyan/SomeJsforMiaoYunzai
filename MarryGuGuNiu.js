import { exec } from "child_process"

let url = `https://mirror.ghproxy.com/https://github.com/GuGuNiu/Miao-Plugin-MBT`
let Path = `./resources/Miao-Plugin-MBT/`
let cmd = ""

export class marry_GuGuNiu extends plugin {
    constructor() {
        super({
            name: '下载咕咕牛图库',
            dsc: '下载安装咕咕牛图库',
            event: 'message',
            priority: -1000,
            rule: [
                {
                    reg: /^#下载咕咕牛图包$/,
                    fnc: 'download_GuGuNiu',
                    permission: "master"
                },
                {
                    reg: /^#更新咕咕牛图包$/,
                    fnc: 'update_GuGuNiu',
                    permission: "master"
                },
                {
                    reg: /^#启用咕咕牛图包$/,
                    fnc: 'apply_GuGuNiu',
                    permission: "master"
                }
            ]
        })
    }

    async download_GuGuNiu(e) {
        await e.reply(`开始下载${url}`)
        cmd = `git clone --depth=1 ${url} ${Path}`
        exec(cmd, { cwd: Path, stdio: 'inherit' }, (error) => {
            if (error) return e.reply(`下载错误：\n${error}`)
            else e.reply(`下载完成`)
        })

        await e.reply(`下载中，耐心等待，保存路径${Path}`)
    }

    async update_GuGuNiu(e) {
        await e.reply(`开始更新图包`)
        cmd = `git pull`
        exec(cmd, { cwd: process.cwd(), stdio: 'inherit' }, (output, error) => {
            if (error) return e.reply(`更新错误：\n${error}`)
            else e.reply(`更新完成：${output}`)
        })

        await e.reply(`更新中，耐心等待，保存路径${Path}`)
    }

    async apply_GuGuNiu(e){
        if(process.platform == 'win32'){
            let _Path = Path.replace(/\//g, '\\')
            cmd = `xcopy ${_Path}* .\\plugins\\miao-plugin\\resources\\profile\\  /e /y`
        }
        else
            cmd = `cp -a -f -l ${Path}* ./plugins/miao-plugin/resources/profile/`
        
        exec(cmd, { cwd: process.cwd(), stdio: 'inherit' }, (error) => {
            if (error) return this.reply(`应用错误：\n${error}`)
            else this.reply(`应用完成`)
        })

        await this.reply(`应用中`)
    }
}
