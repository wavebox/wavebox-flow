import { FileTemplateTypes } from 'FileTemplates'

import type { PresetStreamMessage } from '../BotTypes'

const templates = {
  intro: require('./intro.md'),

  contentscriptCssWhat: require('./contentscript_css_what.md'),
  contentscriptCssInspector: require('./contentscript_css_inspector.md'),
  contentscriptCssOverride: require('./contentscript_css_override.md'),
  contentscriptCssColor: require('./contentscript_css_color.md'),

  contentscriptJsWhat: require('./contentscript_js_what.md'),
  contentscriptJsFind: require('./contentscript_js_find.md'),
  contentscriptJsCreate: require('./contentscript_js_create.md'),
  contentscriptJsContents: require('./contentscript_js_contents.md'),
  contentscriptJsInspector: require('./contentscript_js_inspector.md'),

  backgroundWhat: require('./background_what.md'),
  backgroundInspector: require('./background_inspector.md'),

  popupWhat: require('./popup_what.md')
}

export const introMessage: PresetStreamMessage = {
  response: templates.intro.default
}

function streamMessagesToHelpMenu (messages: PresetStreamMessage[]) {
  return messages.map(({ request, response }) => ({
    title: request,
    message: { request, response }
  }))
}

export const helpMenuMessages = {
  [FileTemplateTypes.ContentscriptCSS]: streamMessagesToHelpMenu([
    { request: 'What can I do with styles?', response: templates.contentscriptCssWhat.default },
    { request: 'How do I style an element on a page?', response: templates.contentscriptCssInspector.default },
    { request: 'My styles aren\'t working', response: templates.contentscriptCssOverride.default },
    { request: 'How do I change the color of something?', response: templates.contentscriptCssColor.default }
  ]),
  [FileTemplateTypes.ContentscriptJS]: streamMessagesToHelpMenu([
    { request: 'What can I do with content scripts?', response: templates.contentscriptJsWhat.default },
    { request: 'How do I find an element on a page?', response: templates.contentscriptJsFind.default },
    { request: 'How do I create a new element in the page?', response: templates.contentscriptJsCreate.default },
    { request: 'How can I change what\'s inside an element?', response: templates.contentscriptJsContents.default },
    { request: 'My code isn\'t working', response: templates.contentscriptJsInspector.default }
  ]),
  [FileTemplateTypes.Background]: streamMessagesToHelpMenu([
    { request: 'What can I do with a background page?', response: templates.backgroundWhat.default },
    { request: 'How do I debug my background page?', response: templates.backgroundInspector.default }
  ]),
  [FileTemplateTypes.Popup]: streamMessagesToHelpMenu([
    { request: 'What can I do with a popup?', response: templates.popupWhat.default }
  ]),
  [FileTemplateTypes.Other]: [
    /* placeholder */
  ]
}
