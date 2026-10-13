exports.index = async (req, res) => {
  return res.redirect("/interview");
};

exports.profile = async (req, res) => {
  res.redirect("/interview");
};
