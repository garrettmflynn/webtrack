import { getQuerySelectorInput } from './utils/selector'
import * as events  from './utils/events'

let allEvents  = {}

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

type EventPayload = Partial<Writeable<Event>> & {timestamp: number, target: Event['target'], type: Event['type']}

const toTransfer = [
    'x',
    'y',
    'deltaX',
    'deltaY',
    'deltaZ',
    'deltaMode',
    'animationName',
    'propertyName',
    'pseudoElement',
    'elapsedTime',

    // Pointer Events
    'pressure',
    'tangentialPressure',
    'tiltX',
    'tiltY',
    'twist',
    'pointerType',
    'azimuthAngle',
    'altitudeAngle',


    // Device Orientation
    'alpha',
    'beta',
    'gamma',
    'absolute',

    // Keys
    'key',
    // 'code',
    'location',
    'repeat',
    'isComposing',
    'ctrlKey',
    'shiftKey',
    'altKey',
    'metaKey',
]

type CallbackType = (ev: EventPayload, raw: Event, name: string) => void
export class Tracker {

    on = false
    #callback?: CallbackType

    events: {[x:string]:EventPayload[]} = {}
    raw: {[x:string]:Event[]} = {}

    #observer: MutationObserver
    #callbacks: {[x:string]: CallbackType } = {}

    #toRemove: Function[] = []

    constructor (callback?: CallbackType) {
        this.#observer = new MutationObserver((mutationList) => {
            for (const mutation of mutationList) {
                if (mutation.type === 'childList') mutation.addedNodes.forEach(el => this.register(el))
            }
        })
        
        if (typeof callback === 'function') this.start(callback)
    }

    start = (callback?: CallbackType) => {

        if (typeof callback === 'function') this.#callback = callback // Replace the callback

        if (!this.on) {
            this.on = true
            this.register(globalThis)
            if (globalThis.document) this.register(globalThis.document)
            if (globalThis.window) {
                const elements = document.getElementsByTagName('*')
                for (let i = 0; i < elements.length; i++) this.register(elements[i])
            }
        } 

    }

    stop = () => {
        this.#observer.disconnect()
        this.on = false
        this.#toRemove.forEach(remove => remove())
        this.#toRemove = []
    }

    set = (name, callback) => {
        name = name.toLowerCase()
        this.#callbacks[name] = callback
    }

    
    register = (target) => {

        // Listen to events based on the name derived from the target
        const name = target.tagName ? target.tagName.toLowerCase() : (target === globalThis ? 'globalThis' : 'document')
        let evArray = allEvents[name]
        if (!evArray) allEvents[name] = evArray = events.getAll(target)

        // Observe elements for new children
        if (target instanceof HTMLElement) this.#observer.observe(target, {  childList: true,  subtree: true  });


        evArray.forEach(evName => {

            if (!this.raw[evName]) this.raw[evName] = [] // Only register the event if it is thrown

            const removeEventListener = () =>  target.removeEventListener(evName, listener)
            
            const listener = (ev) => {

                const isDocument = ev.target === document

                // Only notify of events that are directly triggering the event
                if ( ev.target === target  || isDocument ) {
                    
                    // Track the raw event
                    this.raw[ev.type].push(ev)

                    // Track the compressed payload
                    const payload = this.compress(ev)

                    if (!this.events[ev.type]) this.events[ev.type] = [] // Only register the event if it is thrown
                    this.events[ev.type].push(payload)

                    // Return to the user if they want it
                    const returnName = isDocument ? 'document' : name
                    if (this.#callback) this.#callback(payload, ev, returnName)
                    if (this.#callbacks[ev.type]) this.#callbacks[ev.type](payload, ev, returnName)
                }
            }

            target.addEventListener(evName, listener)

            this.#toRemove.push(removeEventListener)
        })
    }

    compress = (ev: Event) => {
        const obj: EventPayload = {
            timestamp: ev.timeStamp,
            target: ev.target,
            type: ev.type
        };

        toTransfer.forEach(key => {
            if (key in ev) obj[key] = ev[key]
        })

        // for (let k in e) {
        //     if (!(k in obj)) {
        //         if (!keysExcludedByEventType[k]) keysExcludedByEventType[k] = new Set()
        //         keysExcluded.add(k)
        //         keysExcludedByEventType[k].add(e.type)
        //     }
        // }

        return obj
    }

    stringify = (ev: EventPayload) => {
        try {
        return JSON.stringify(ev, (k, v) => {
                if (v instanceof Element) return getQuerySelectorInput(v);
                if (v instanceof Node) return v.nodeName;
                if (v instanceof Window) return 'Window';
                return v;
            }, ' ')
        } catch (err) {
            console.warn('Failed to pass event type', ev.type, err)
            return
        }
    }
}