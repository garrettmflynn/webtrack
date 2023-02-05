import child_process from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://superuser.com/questions/382616/detecting-currently-active-window
const linuxCommand = `xprop -id $(xprop -root 32x '\t$0' _NET_ACTIVE_WINDOW | cut -f 2) _NET_WM_NAME`

// https://stackoverflow.com/questions/46351885/how-to-grab-the-currently-active-foreground-window-in-powershell
const windowsCommand = path.join(__dirname, 'windows', 'currentActiveWindow.ps1')

// https://gist.github.com/timpulver/4753750
const macFile = path.join(__dirname, 'mac', 'currentActiveWindow.sh')

const platform = process.platform

let latestResult = null

const onChange = (res) => {
    console.log('New Active Window:', res)
}

const onResult = (res) => {
    if (platform === 'darwin') {
        const [name, file, tab] = res.trim().split(', ')

        res = {name, file, tab}
        if (file.includes('Applications')) res.app = file.split('Applications:')[1].split('.app')[0]
    }

    // Monitor for Changes
    if (latestResult === JSON.stringify(res)) return
    else {
        onChange(res)
        latestResult = JSON.stringify(res)
    }
}

const onError = (err) => {
    console.error(`${platform} Error:`, err)
}

const onComplete = () => {
    console.error(`${platform} Check Complete`)
}

const spawnProcess = (...args) => {
    const child = child_process.spawn(...args);
    child.stdout.on("data", onResult);
    child.stderr.on("data", onError)
    child.on("exit", onComplete);
    child.stdin.end(); //end input
}

const execCommand = (command) => {
    child_process.exec(command, (error, stdout, stderr) => {
        if (error) {
            onError(error)
            return;
        }

        if (stderr) {
            onError(stderr)
            return;
        }

        onResult(stdout)
        onComplete()
    });
}



const check = () => {
    if (platform === 'win32') spawnProcess("powershell.exe", [windowsCommand]);
    else if (platform === 'darwin')  execCommand(`sh ${macFile}`);
    else if (platform === 'linux') execCommand(linuxCommand)
    else console.error('Unsupported platform: ' + platform)
}


setInterval(check, 1000)