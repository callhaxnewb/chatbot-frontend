import React from 'react';
import ChatComponent from './components/ChatComponent';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Industrial Startup Chatbot</h1>
      </header>
      <main>
        <ChatComponent />
      </main>
    </div>
  );
}

export default App;