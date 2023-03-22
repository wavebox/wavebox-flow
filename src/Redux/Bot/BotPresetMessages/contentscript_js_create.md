You can create new elements and place them on the page. For example...

```js
// Create a new image element
const img = document.createElement('img')
img.src = 'https://i.giphy.com/g7GKcSzwQfugw.gif'

// Add the image element into the page
document.body.prepend(img)

// Give your image element some styles so it's on the top of the page
img.style.position = 'fixed'
img.style.top = '0px'
img.style.left = '0px'
img.style.zIndex = '9999'

// Add some mouse hover event listeners to change the img

imgElement.onmouseover = function() {
  img.src = 'https://i.giphy.com/sIIhZliB2McAo/giphy.gif'
}

img.onmouseout = function() {
  img.src = 'https://i.giphy.com/g7GKcSzwQfugw.gif'
}
```
