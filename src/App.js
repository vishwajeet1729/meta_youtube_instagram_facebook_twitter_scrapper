import logo from './logo.svg';
import './App.css';
import YouTubeAnalytics from './YouTubeAnalytics';
import TwitterAnalytics from './TwitterAnalytics';
import InstagramAnalytics from './InstagramAnalytics';
import FacebookAnalytics from './FacebookAnalytics';
function App() {
  return (
    <div className="App">
      <YouTubeAnalytics />
      <TwitterAnalytics />
      <InstagramAnalytics />
      <FacebookAnalytics />
    </div>
  );
}

export default App;
