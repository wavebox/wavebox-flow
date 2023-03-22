You can use `textContent` to change what's inside an element if it only contains text, or you can use `innerHTML` if you want to write HTML to place inside an element

```js
// Change the text
document.querySelector('h1').textContent = 'My new heading'

// Change the contents
document.querySelector('h1').innerHTML = '<img src="https://i.giphy.com/sIIhZliB2McAo/giphy.gif" /><span>My new heading</span>'
```