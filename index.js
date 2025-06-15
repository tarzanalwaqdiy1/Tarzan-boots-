const express = require('express')
const app = express()
const PORT = 3000

app.get('/', (req, res) => {
  res.send(`<h1>🔥 بوت طرزان يعمل بنجاح!</h1><p>هذا هو السيرفر الأساسي المرتبط بـ Ngrok.</p>`)
})

app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`)
})
