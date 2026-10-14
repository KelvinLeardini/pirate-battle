import React from 'react';
import { GameCanvas } from './components/GameCanvas';

export const App: React.FC = () => {
  return (
    <main className="w-screen h-screen">
      <GameCanvas />
    </main>
  );
};

export default App;