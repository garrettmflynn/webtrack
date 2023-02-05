import { checkActiveWindow } from "./activeWindow";

import ioHook from 'iohook'

// Monitor Active Window
setInterval(checkActiveWindow, 1000)

// // Monitor User Events
// // NOTE: Running into build issues for the package...
// // https://wilix-team.github.io/iohook/usage.html#mouseclick
// const events = [
//     'mousemove',
//     'mouseclick',
//     'mousedown',
//     'mouseup',
//     'mousedrag',
//     'mousewheel',
//     'keydown',
//     'keyup',

// ]

// events.forEach(evName => {
//     ioHook.on(evName, (event) => {
//         console.log(evName, event);
//       });
// })

// // ioHook.disableClickPropagation();

// // Register and start hook
// ioHook.start();