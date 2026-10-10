// Returns the visitor's country as Vercel sees it, so the page can pick Danish or English.
module.exports = (req, res) => {
  const country = req.headers['x-vercel-ip-country'] || null;
  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).json({ country });
};
