import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeView from './views/homeView';  // Corregir la importación de HomeView

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomeView />} />  {/* Cambiar MainView a HomeView */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
