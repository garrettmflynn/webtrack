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
    console.log('New Active Window:', res.id, res)
}

const onResult = (res) => {
    if (platform === 'darwin') {
        const [name, path, title] = res.trim().split(', ')
        res = {name, path, title}
        if (path.includes('Applications')) res.origin = path.split('Applications:')[1].split('.app')[0]
        res.id = `${title} - ${res.origin ?? path}`
    } else if (platform === 'win32') {
        const title = `${res}`
        res = {title, id: title} // NOTE: To make this equivalent with Mac, we need to track the file and app name.
    } else if (platform === 'linux'){
        console.error('Linux outputs are not yet parsed...')
    }

    // Monitor for Changes
    if (latestResult?.id === res?.id) return
    else {
        onChange(res)
        latestResult = res
    }
}

const onError = (err) => {
    console.error(`${platform} Errors: `+ err)
}

const onComplete = () => {
    // console.error(`${platform} Check Complete`)
}

const spawnProcess = (...args) => {
    const child = child_process.spawn(...args);
    child.stdout.on("data", onResult);
    child.stderr.on("data", onError)
    child.on("exit", onComplete);
    child.stdin.end(); //end input
    // child.stdout.on("data",function(data){
    //     console.log("Powershell Data: " + data);
    // });
    // child.stderr.on("data",function(data){
    //     console.log("Powershell Errors: " + data);
    // });
    // child.on("exit",function(){
    //     console.log("Powershell Script finished");
    // });
    // child.stdin.end(); //end input
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



export const checkActiveWindow = () => {
    if (platform === 'win32') spawnProcess("powershell.exe", [windowsCommand]);
    else if (platform === 'darwin')  execCommand(`sh ${macFile}`);
    else if (platform === 'linux') execCommand(linuxCommand)
    else console.error('Unsupported platform: ' + platform)
}