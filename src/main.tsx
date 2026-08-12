import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Tartib muhim: font → kutubxona uslublari → bizning tokenlarimiz va override'lar.
import '@fontsource-variable/inter'
// dgz-ui — baza komponentlar uslublari; dgz-ui-shared undan keyin, chunki
// yuqori qatlam komponentlari baza uslublarini qayta yozadi.
import 'dgz-ui/styles.css'
import 'dgz-ui-shared/styles.css'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
