const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY; // Assuming API_KEY is stored in environment variables

  if (!apiKey) {
    return res.status(401).json({ message: 'API key is missing' });
  }

  if (apiKey === validApiKey) {
    // Optionally attach a generic user object for consistency
    req.user = { id: 'clinic_staff' };
    next();
  } else {
    res.status(401).json({ message: 'Invalid API key' });
  }
};

module.exports = authenticateApiKey;