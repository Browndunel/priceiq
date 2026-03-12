// MOCK DATA — basé sur priceiq_dataset_cleaned.csv (DuckDB + Polars backend)

export const RETAILERS = ['Amazon','Walmart','Best Buy','Target','Costco','eBay','Newegg','B&H','Micro Center','Adorama']

const PRODUCT_IMAGES = {
  1:  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80', // Redmi 10 Power
  2:  'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&q=80', // OnePlus Nord CE 2
  3:  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', // Bullets Z2
  4:  'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80', // Samsung M33
  7:  'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&q=80', // boAt Airdopes
  8:  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80', // Apple 20W
  9:  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80',    // Fire-Boltt
  12: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', // Redmi A1
  18: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80', // Lapster
  22: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&q=80', // Redmi 10A
  23: 'https://images.unsplash.com/photo-1617997455403-41f333d44d5b?w=400&q=80', // OnePlus 11R
  29: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&q=80', // iQOO Z6
  30: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80', // MI Power Bank
}

export const MOCK_PRODUCTS = [
  { id: 1,  name: 'Redmi 10 Power',                 category: 'Smartphones'  },
  { id: 2,  name: 'OnePlus Nord CE 2',               category: 'Smartphones'  },
  { id: 3,  name: 'OnePlus Bullets Z2 Bluetooth',   category: 'Audio'        },
  { id: 4,  name: 'Samsung Galaxy M33 5G',          category: 'Smartphones'  },
  { id: 7,  name: 'boAt Airdopes 141 Bluetooth',    category: 'Audio'        },
  { id: 8,  name: 'Apple 20W USB-C Power',          category: 'Accessoires'  },
  { id: 9,  name: 'Fire-Boltt Ninja Call Pro',      category: 'Wearables'    },
  { id: 12, name: 'Redmi A1',                       category: 'Smartphones'  },
  { id: 18, name: 'Lapster 5-in-1 Multi-Function',  category: 'Accessoires'  },
  { id: 22, name: 'Redmi 10A',                      category: 'Smartphones'  },
  { id: 23, name: 'OnePlus 11R 5G',                 category: 'Smartphones'  },
  { id: 29, name: 'iQOO Z6 Lite 5G',                category: 'Smartphones'  },
  { id: 30, name: 'MI Power Bank 3i',               category: 'Accessoires'  },
]

// Seed-based random — same ID = same product, but search results shuffled
function seededRandom(seed) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
}

function generateHistory(basePrice, days = 30, seed = 42) {
  const rng = seededRandom(seed)
  const history = {}
  RETAILERS.slice(0, 5).forEach((retailer, ri) => {
    history[retailer] = []
    let price = basePrice * (0.88 + ri * 0.06)
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      price = price * (0.978 + rng() * 0.044)
      history[retailer].push({ date: date.toISOString().split('T')[0], price: Math.round(price * 100) / 100 })
    }
  })
  return history
}

const BASE_PRICES = {
  1:149, 2:229, 3:49, 4:299, 7:59, 8:19,
  9:89, 12:99, 18:39, 22:119, 23:599, 29:189, 30:29
}

export function getMockProduct(id) {
  const p = MOCK_PRODUCTS.find(p => p.id === Number(id))
  if (!p) return null
  const rng = seededRandom(id * 7 + 13)
  const basePrice = BASE_PRICES[id] || (5000 + id * 800)

  const prices = RETAILERS.slice(0, 6).map((retailer, i) => ({
    retailer,
    price: Math.round(basePrice * (0.91 + i * 0.04 + rng() * 0.03) * 100) / 100,
    in_stock: rng() > 0.18,
    last_updated: `il y a ${Math.floor(rng() * 8 + 1)} min`,
  }))

  const recTypes = ['buy_now','wait','good_deal']
  const recType  = recTypes[Math.floor(rng() * 3)]
  const predDelta = (rng() - 0.48) * 0.12
  const predicted = Math.round(basePrice * (1 + predDelta) * 100) / 100

  return {
    ...p,
    image: PRODUCT_IMAGES[Number(id)] || null,
    prices,
    history: generateHistory(basePrice, 30, id),
    prediction: {
      current_price:  basePrice,
      predicted_price: predicted,
      trend: predDelta > 0 ? 'up' : 'down',
      confidence: Math.round(65 + rng() * 30),
    },
    recommendation: {
      buy_now:   { type:'buy_now',   label:'Acheter maintenant', reason:'Prix au plus bas sur 30 jours' },
      wait:      { type:'wait',      label:'Attendre',           reason:'Baisse prévue dans les 7 jours' },
      good_deal: { type:'good_deal', label:'Bonne affaire !',   reason:`Prix inférieur de ${Math.round(rng()*15+5)}% à la moyenne` },
    }[recType],
  }
}

// Search: shuffle results based on query string for "random feel"
function strHash(s) { return s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0) }

export function searchMock(query) {
  const q = (query || '').toLowerCase()
  const filtered = q.length > 1
    ? MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    : [...MOCK_PRODUCTS]
  // Shuffle with query hash for consistent-but-varied ordering
  const seed = Math.abs(strHash(q + Date.now().toString().slice(-4)))
  const rng  = seededRandom(seed)
  return filtered.map(p => ({ ...p, sort: rng() })).sort((a, b) => a.sort - b.sort).map(({ sort, ...p }) => p)
}

export const MOCK_TRENDING = (() => {
  const rng = seededRandom(Date.now() % 1000)
  return [...MOCK_PRODUCTS].map(p => ({ ...p, sort: rng() })).sort((a, b) => a.sort - b.sort).slice(0, 8)
})()
