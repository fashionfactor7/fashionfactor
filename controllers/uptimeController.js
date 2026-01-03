exports.uptimeCheck = (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "FashionFactor API",
    timestamp: new Date().toISOString()
  });
};
