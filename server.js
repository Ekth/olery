const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

const { sequelize, testConnection } = require('./database');
require('./models');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const propertiesRoutes = require('./routes/properties');
const tenantsRoutes = require('./routes/tenants');
const paymentsRoutes = require('./routes/payments');
const { auth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;
const companyProfilePath = path.join(__dirname, 'data', 'company-profile.json');
const defaultCompanyProfile = {
  ownerName: 'Ndiba Gabou Aïn Soph',
  companyName: 'o´lery Immobilier',
  email: 'contact@olery.immo',
  phone: '+221 77 000 0000',
  city: 'Dakar',
  slogan: 'Gestion immobilière premium',
};

function readCompanyProfile() {
  try {
    if (!fs.existsSync(companyProfilePath)) {
      fs.mkdirSync(path.dirname(companyProfilePath), { recursive: true });
      fs.writeFileSync(companyProfilePath, JSON.stringify(defaultCompanyProfile, null, 2), 'utf8');
      return { ...defaultCompanyProfile };
    }

    const raw = fs.readFileSync(companyProfilePath, 'utf8');
    return { ...defaultCompanyProfile, ...JSON.parse(raw || '{}') };
  } catch (error) {
    console.warn('⚠️ Lecture du profil entreprise impossible:', error.message);
    return { ...defaultCompanyProfile };
  }
}

function writeCompanyProfile(payload = {}) {
  const nextProfile = {
    ...defaultCompanyProfile,
    ownerName: payload.ownerName || defaultCompanyProfile.ownerName,
    companyName: payload.companyName || defaultCompanyProfile.companyName,
    email: payload.email || defaultCompanyProfile.email,
    phone: payload.phone || defaultCompanyProfile.phone,
    city: payload.city || defaultCompanyProfile.city,
    slogan: payload.slogan || defaultCompanyProfile.slogan,
  };

  fs.mkdirSync(path.dirname(companyProfilePath), { recursive: true });
  fs.writeFileSync(companyProfilePath, JSON.stringify(nextProfile, null, 2), 'utf8');
  return nextProfile;
}

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5500',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/biens', propertiesRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/locataires', tenantsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/paiements', paymentsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/company-profile', (_req, res) => {
  res.json(readCompanyProfile());
});

app.put('/api/company-profile', auth, (req, res) => {
  const profile = writeCompanyProfile(req.body || {});
  res.json({ message: 'Profil entreprise mis à jour', profile });
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur' });
});

function getLocalNetworkUrls(port) {
  const allAddresses = Object.entries(os.networkInterfaces())
    .flatMap(([name, addresses]) => (addresses || []).map((details) => ({ name, details })))
    .filter(({ details }) => details && details.family === 'IPv4' && !details.internal)
    .map(({ name, details }) => ({ name: name.toLowerCase(), address: details.address }));

  const preferredAddresses = allAddresses.filter(({ name, address }) => {
    const isPrivateLan = address.startsWith('192.168.') || address.startsWith('10.') || /^172\.(1[6-9]|2\d|3[0-1])\./.test(address);
    const isVirtualAdapter = name.includes('vmware') || name.includes('virtual') || name.includes('hyper-v') || name.includes('loopback');
    return isPrivateLan && !isVirtualAdapter;
  });

  const chosenAddresses = preferredAddresses.length
    ? preferredAddresses
    : allAddresses.filter(({ address }) => !address.startsWith('169.254.'));

  return chosenAddresses.map(({ address }) => `http://${address}:${port}`);
}

const startServer = async () => {
  try {
    const dbReady = await testConnection();

    if (dbReady) {
      await sequelize.sync({ alter: true });
      console.log('✅ Base de données synchronisée');
    } else {
      console.log('⚠️ PostgreSQL indisponible — démarrage en mode fallback');
    }

    const host = process.env.HOST || '0.0.0.0';

    app.listen(PORT, host, () => {
      const networkUrls = getLocalNetworkUrls(PORT);
      const primaryNetworkUrl = networkUrls[0] || `http://localhost:${PORT}`;

      console.log(`
╔═══════════════════════════════════════╗
║     o´lery API - Production Ready     ║
╚═══════════════════════════════════════╝
🚀 Serveur démarré sur http://localhost:${PORT}
📡 API disponible : http://localhost:${PORT}/api
🌐 Réseau local : ${primaryNetworkUrl}
🔐 Connexion : ${primaryNetworkUrl}/login.html
      `);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
};

startServer();
