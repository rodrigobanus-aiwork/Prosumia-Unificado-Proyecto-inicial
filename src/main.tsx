import React from 'react';
import {createRoot} from 'react-dom/client';
import UnifiedDashboard from './components/UnifiedDashboard';
import './index.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><UnifiedDashboard/></React.StrictMode>);
