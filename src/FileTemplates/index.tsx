import PaletteIcon from '@mui/icons-material/Palette'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import CycloneIcon from '@mui/icons-material/Cyclone'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'
import { pink, green, lightBlue, purple, amber } from '@mui/material/colors'

const templateData = {
  csStyles: require('FileTemplates/contentscript_styles.txt'),
  csFeature: require('FileTemplates/contentscript_feature.txt'),
  csReplace: require('FileTemplates/contentscript_replace.txt'),
  background: require('FileTemplates/background.txt'),
  popup: require('FileTemplates/popup.txt')
}

export enum FileTemplateTypes {
  ContentscriptCSS,
  ContentscriptJS,
  Background,
  Popup,
  Other
}

export interface FileTemplate {
  id: string
  name: string
  description: string
  colors: [string, string]
  Icon: React.ElementType
  type: FileTemplateTypes
  content: string
}

export type FileTemplates = Record<string, FileTemplate>

export const fileTemplates: FileTemplates = {
  csStyle: {
    id: 'csStyle',
    name: 'Style',
    description: 'Change the look of a website',
    colors: [purple[100], purple[800]],
    Icon: PaletteIcon,
    type: FileTemplateTypes.ContentscriptCSS,
    content: templateData.csStyles.default
  },
  csFeature: {
    id: 'csFeature',
    name: 'Feature',
    description: 'Add your own features to a website',
    colors: [amber[100], amber[800]],
    Icon: CycloneIcon,
    type: FileTemplateTypes.ContentscriptJS,
    content: templateData.csFeature.default
  },
  csReplace: {
    id: 'csReplace',
    name: 'Replace',
    description: 'Replace content on a site',
    colors: [green[100], green[800]],
    Icon: FindReplaceIcon,
    type: FileTemplateTypes.ContentscriptJS,
    content: templateData.csReplace.default
  },
  background: {
    id: 'background',
    name: 'Background',
    description: 'Run code in the background across pages',
    colors: [lightBlue[100], lightBlue[800]],
    Icon: ContentCopyIcon,
    type: FileTemplateTypes.Background,
    content: templateData.background.default
  },
  popup: {
    id: 'popup',
    name: 'Popup',
    description: 'Open a popup from the browser toolbar',
    colors: [pink[100], pink[800]],
    Icon: ChatBubbleIcon,
    type: FileTemplateTypes.Popup,
    content: templateData.popup.default
  }
}

export default fileTemplates
