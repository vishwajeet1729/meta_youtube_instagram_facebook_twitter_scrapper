import logo from './logo.svg';
import './App.css';
import YouTubeAnalytics from './YouTubeAnalytics';
import TwitterAnalytics from './TwitterAnalytics';
import InstagramAnalytics from './InstagramAnalytics';
import FacebookAnalytics from './FacebookAnalytics';
import { useState } from 'react';

const PROFILES = {
  bjp_maharashtra: {
    label: "BJP Maharashtra",
    twitter: "https://x.com/BJP4Maharashtra",
    facebook: "https://www.facebook.com/bjpformaharashtra",
    instagram: "https://www.instagram.com/bjp4maharashtra/",
    youtube: "BJP4MH"
  },
  bjp_karnataka: {
    label: "BJP Karnataka",
    twitter: "https://x.com/BJP4Karnataka",
    facebook: "https://www.facebook.com/BJP4Karnataka",
    instagram: "https://www.instagram.com/bjp4karnataka/",
    youtube: "BJPKARLive"
  }
};

function App() {
  const [selectedProfileKey, setSelectedProfileKey] = useState('bjp_maharashtra');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleProfileChange = (e) => {
    setSelectedProfileKey(e.target.value);
    setShowAnalytics(false); // Reset to hide analytics until submitted
  };

  const handleSubmit = () => {
    setShowAnalytics(true);
  };

  const selectedProfile = PROFILES[selectedProfileKey];

  return (
    <div className="App">
      <header className="app-header">
        <h1>Social Media Analytics</h1>
        <div className="controls">
          <select
            value={selectedProfileKey}
            onChange={handleProfileChange}
            className="profile-select"
          >
            {Object.entries(PROFILES).map(([key, profile]) => (
              <option key={key} value={key}>
                {profile.label}
              </option>
            ))}
          </select>
          <button onClick={handleSubmit} className="submit-button">
            Submit
          </button>
        </div>
      </header>

      {showAnalytics && (
        <div className="analytics-container">
          <section className="analytics-section">
            <h2>YouTube</h2>
            <YouTubeAnalytics query={selectedProfile.youtube} />
          </section>

          <section className="analytics-section">
            <h2>Twitter</h2>
            <TwitterAnalytics url={selectedProfile.twitter} />
          </section>

          <section className="analytics-section">
            <h2>Instagram</h2>
            <InstagramAnalytics url={selectedProfile.instagram} />
          </section>

          <section className="analytics-section">
            <h2>Facebook</h2>
            <FacebookAnalytics url={selectedProfile.facebook} />
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
