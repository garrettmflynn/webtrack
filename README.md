# webtrack
 Quickly monitor all page and user behaviors

We take the approach that **we should only run callbacks on events directly tied to the target object**. In this sense, `webtrack` behaves as if `event.stopPropagation` was called while retaining the ability to bubble events up the DOM tree.