import { exec, execSync } from "child_process"

let url = `https://github.com/GuGuNiu/Miao-Plugin-MBT`
let Path = `./resources/Miao-Plugin-MBT/`
let cmd = ""

export class marry_GuGuNiu extends plugin {
    constructor() {
        super({
            name: '下载咕咕牛图库',
            dsc: '下载安装咕咕牛图库',
            event: 'message',
            priority: 2955,
            rule: [
                {
                    reg: /^#下载咕咕牛图包$/,
                    fnc: 'download_GuGuNiu',
                    permission: "master"
                },
                {
                    reg: /^#(强制)?更新咕咕牛图包$/,
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
        exec(cmd, { cwd: process.cwd(), stdio: 'inherit' }, (error) => {
            if (error) return e.reply(`下载错误：\n${error}`)
            else {e.reply(`下载完成`);this.apply_GuGuNiu()}
        })

        await e.reply(`下载中，耐心等待，保存路径${Path}`)
    }

    async update_GuGuNiu(e) {
        cmd = `git pull`
        if (this.e.msg.includes('强制'))
            execSync('git fetch && git reset --hard', { cwd: Path})
        exec(cmd, { cwd: Path, stdio: 'inherit' }, (output, error) => {
            if (error) {
                if(error.match(/Already up to date\./))
                    e.reply(`咕咕牛正在偷懒`)
                else
                    {e.reply(`咕咕牛更新结束`);this.apply_GuGuNiu();}
            }
            else {e.reply(`更新错误：${output}`);return}
        })

        await e.reply(`更新中，耐心等待，保存路径${Path}`)
    }

    async apply_GuGuNiu(){
        await this.reply(`应用中`)
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
    }
}
