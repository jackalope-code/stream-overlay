import React from 'react';
import logo from './logo.svg';
import './App.css';
import Overlay from './Overlay';
import OverlayEditPage from './OverlayEditPage';
import { Link } from 'react-router-dom';

function App() {
  return (
    <>
      <button><Link to="editor">Editor</Link></button>
      <button><Link to="view">View overlay</Link></button>
    </>
  );
}

export default App;
