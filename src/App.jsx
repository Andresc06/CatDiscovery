import { useState } from 'react';
import './App.css';

const API_KEY = import.meta.env.VITE_CAT_API_KEY;
const SEARCH_URL = 'https://api.thecatapi.com/v1/images/search';

function getRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function App() {
  const [cat, setCat] = useState(null);
  const [bans, setBans] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const makeCat = (item) => {
    const breed = item?.breeds?.[0] || {};
    return {
      id: item.id,
      image: item.url,
      name: breed.name || '',
      origin: breed.origin || '',
      lifeSpan: breed.life_span ? `${breed.life_span} years` : '',
      weight: breed.weight?.imperial ? `${breed.weight.imperial} lbs` : '',
    };
  };

  const discover = async (currentBans = bans) => {
    setLoading(true);
    setError('');

    try {
      let found = null;

      for (let i = 0; i < 5 && !found; i++) {
        const res = await fetch(
          `${SEARCH_URL}?has_breeds=1&limit=10&api_key=${API_KEY}`
        );
        if (!res.ok) throw new Error('API error');
        const data = await res.json();

        found = data
          .map(makeCat)
          .find(
            (c) =>
              c.name &&
              c.image &&
              c.lifeSpan &&
              !currentBans.includes(c.name) &&
              !currentBans.includes(c.origin) &&
              !currentBans.includes(c.lifeSpan) &&
              !currentBans.includes(c.weight)
          );
      }

      if (!found) {
        setError('No cats match your filters. Try removing a ban.');
        return;
      }

      setCat(found);
      setHistory((prev) => [found, ...prev]);
    } catch {
      setError('Could not load cats. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = (val) => {
    const next = bans.includes(val)
      ? bans.filter((b) => b !== val)
      : [...bans, val];

    setBans(next);
  };

  return (
    <main className="app">
      <section className="hero">
        <p className="tag">😺 The Cat API</p>
        <h1>Meow!</h1>
        <p className="sub">
          Discover cats from around the world. Click a breed, origin, or life span to ban it!
        </p>
        <button type="button" className="btn" onClick={() => discover()} disabled={loading}>
          {loading ? 'Loading...' : '🐱 Discover!'}
        </button>
        {error && <p className="err">{error}</p>}
      </section>

      <section className="wrap">
        <div className="card">
          {cat ? (
            <>
              <h2>{cat.name}</h2>
              <p className="tiny">Click a chip to ban it</p>
              <div className="chips">
                <button type="button" className="chip" onClick={() => toggleBan(cat.name)}>
                  {cat.name}
                </button>
                {cat.origin && (
                  <button type="button" className="chip" onClick={() => toggleBan(cat.origin)}>
                    {cat.origin}
                  </button>
                )}
                <button type="button" className="chip" onClick={() => toggleBan(cat.lifeSpan)}>
                  {cat.lifeSpan}
                </button>
                {cat.weight && (
                  <button type="button" className="chip" onClick={() => toggleBan(cat.weight)}>
                    {cat.weight}
                  </button>
                )}
              </div>
              <img className="pic" src={cat.image} alt={cat.name} />
            </>
          ) : (
            <div className="empty">
              <p>{loading ? 'Loading...' : 'Press Discover to start!'}</p>
            </div>
          )}
        </div>

        <aside className="ban">
          <h2>Ban List</h2>
          <p>Select an attribute in your listing to ban it</p>
          {bans.length === 0 && <p className="small">No bans yet.</p>}
          <div className="ban-list">
            {bans.map((item) => (
              <button key={item} type="button" className="ban-btn" onClick={() => toggleBan(item)}>
                {item}
              </button>
            ))}
          </div>
        </aside>
      </section>

      {history.length > 0 && (
        <section className="history">
          <h2>History</h2>
          <div className="history-grid">
            {history.map((item, i) => (
              <div key={`${item.id}-${i}`} className="history-card">
                <img src={item.image} alt={item.name} />
                <p className="hname">{item.name}</p>
                <p className="hdetail">{item.origin}</p>
                <p className="hdetail">{item.lifeSpan}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
