import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Studio from './components/Studio';

function App() {
  const [showStudio, setShowStudio] = useState(false);

  if (!showStudio) {
    return <LandingPage onEnterStudio={() => setShowStudio(true)} />;
  }

  return <Studio onBackToHome={() => setShowStudio(false)} />;
}

export default App;
