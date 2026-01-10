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
  },
  bjp_tamilnadu: {
    label: "BJP Tamil Nadu",
    twitter: "https://x.com/BJP4TamilNadu",
    facebook: "https://www.facebook.com/BJP4TamilNadu",
    instagram: "https://www.instagram.com/bjp4tamilnadu/",
    youtube: "bjp4tamilnad"
  },
  bjp_kerala: {
    label: "BJP Kerala",
    twitter: "https://x.com/BJP4Kerala",
    facebook: "https://www.facebook.com/BJP4Keralam",
    instagram: "https://www.instagram.com/bjp4keralam/",
    youtube: "BJP4Keralam"
  },
  bjp_gujarat: {
    label: "BJP Gujarat",
    twitter: "https://x.com/BJP4Gujarat",
    facebook: "https://www.facebook.com/BJP4Gujarat",
    instagram: "https://www.instagram.com/bjp4gujarat/",
    youtube: "BJP4Gujarat"
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
          <a
            href="https://github.com/vishwajeet1729/meta_youtube_instagram_facebook_twitter_scrapper"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            <span>★</span> Star on GitHub
          </a>
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
