import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import DashboardPage from './pages/Dashboard';
import store from './store';
import GlobalStyles from './styled/globalStyles';

function App() {
  return (
    <Provider store={store}>
      <GlobalStyles />
      <Header />
      <Router>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
