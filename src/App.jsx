import React, { useState } from 'react';
import { Home } from './pages/Home/Home';
import { SplashScreen } from './components/SplashScreen/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Home />
    </>
  );
}

export default App;
