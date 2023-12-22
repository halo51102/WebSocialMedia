
export const countReports = (req, res) => {
    const q = "SELECT count(id) as count FROM socialmedia.reports"
  
    db.query(q, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data)
    })
  }