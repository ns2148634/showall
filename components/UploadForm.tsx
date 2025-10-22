export default function UploadForm() {
  const router = useRouter()
  const referrer_id = router.query.referrer_id || null
  const [form, setForm] = useState({ ... })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const cardData = {
      ...form,
      referrer_id: referrer_id
    }
    const { data, error } = await supabase.from('cards').insert([cardData])
    if (data) {
      const cardUrl = `https://abcd.com/card/${data[0].url_slug}`
      await fetch("/api/sendMail", {
        method: "POST",
        body: JSON.stringify({
          to: form.email,
          subject: "你的ABCD百業名片專屬連結",
          html: `您的名片已成功上傳！<br>點此瀏覽專屬頁：<a href="${cardUrl}">${cardUrl}</a>`
        }),
        headers: { "Content-Type": "application/json" }
      })
      // 跳轉/顯示完成通知
    } else {
      // 錯誤處理
    }
    setLoading(false)
  }

  return (
    <form onSubmit={e => {e.preventDefault(); handleSubmit();}}>
      {/* 表單內容 */}
      <button type="submit" disabled={loading}>送出</button>
    </form>
  )
}
