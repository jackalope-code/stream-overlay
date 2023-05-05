import React from 'react';
import logo from './logo.svg';
import Overlay from './Overlay';
import OverlayEditPage from './OverlayEditPage';
import { Link } from 'react-router-dom';
import './body-transparency.css'

function App() {
  return (
    <>
      <button><Link to="edit">Editor</Link></button>
      <button><Link to="view">View overlay</Link></button>
    </>
  );
}

export default App;
