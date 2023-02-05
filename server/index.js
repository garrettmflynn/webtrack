import { checkActiveWindow } from "./activeWindow.js";


try {

    const ioHook = await import('iohook')

    // Monitor User Events
    // NOTE: Running into build issues for the package on Mac and Windows...
    // https://wilix-team.github.io/iohook/usage.html#mouseclick
    const events = [
        'mousemove',
        'mouseclick',
        'mousedown',
        'mouseup',
        'mousedrag',
        'mousewheel',
        'keydown',
        'keyup',

    ]

    events.forEach(evName => {
        ioHook.on(evName, (event) => {
            console.log(evName, event);
        });
    })

    // ioHook.disableClickPropagation();

    // Register and start hook
    ioHook.start();
} catch (e) {
    console.error('\n-------------------------- Failed to load iohook -------------------------- ')
    console.error('Full Error Message:', e.message)
}

// Monitor Active Window
console.error('\n-------------------------- Monitoring Active Window -------------------------- ')
setInterval(checkActiveWindow, 1000)
