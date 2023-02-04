import * as properties from './properties'

type GetEventsOptions = {
    callback?: (event: Event) => void,
    ignore?: string[]
}

export const getAll = (target, options:GetEventsOptions = {}) => {
    let events: string[] = [];
    const allProperties = properties.getAllPropertyNames(target)
    allProperties.forEach((key) => {
        if (/^on/.test(key)) {
            const event = key.slice(2)
            if (options.callback) target.addEventListener(event, options.callback);
            if (!options.ignore || !options.ignore.includes(event)) events.push(event);
        }
    });
    return events
}