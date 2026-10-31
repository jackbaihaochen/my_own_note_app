import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// No StrictMode: its double-mounted effects would create two MindMap instances on one element
createRoot(document.getElementById('root')!).render(<App />)
