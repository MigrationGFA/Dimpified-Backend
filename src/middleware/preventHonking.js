const preventHotLinking = (allowedDomains) => {
  console.log("this is domain", allowedDomains);
  return (req, res, next) => {
    const referer = req.get("referer");
    console.log("Referer:", referer);

    if (
      !referer ||
      !allowedDomains.some((domain) => referer.includes(domain))
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};

module.exports = preventHotLinking;
