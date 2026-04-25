export function contextData(query: string) {
  return `
Jawab pertanyaan berikut berdasarkan context di bawah ini. Jawab dengan ringkas, informatif, dan gunakan bahasa yang sama dengan pertanyaan user.

## Identitas
- **Nama**: Ahmad Rosyihuddin (dipanggil Rosik)
- **Profesi**: Software Engineer & Machine Learning Enthusiast
- **Email**: rosyihuddin.dev@gmail.com
- **Website**: https://arosyihuddin.my.id
- **GitHub**: https://github.com/arosyihuddin
- **LinkedIn**: https://linkedin.com/in/ahmad-rosyihuddin
- **Lokasi**: Jawa Timur, Indonesia

## Pendidikan
- **Universitas Trunojoyo Madura (UTM)** — S1 Teknik Informatika (2020–2024), IPK: 3.80/4.0

## Sertifikasi
- **TensorFlow Developer Certificate** (Oktober 2023–2026)

## Pengalaman Kerja

### Backend Developer — ERA Real Estate (Oktober 2024–Sekarang)
- Membangun API yang efisien dan skalabel menggunakan **Node.js, Express, GraphQL, TypeORM, MySQL**
- Optimasi sistem dengan **Redis** untuk caching
- Mengembangkan layanan menggunakan **FastAPI** (Python)
- Mengelola infrastruktur server menggunakan **VMware ESXi** (instalasi, konfigurasi, monitoring)
- Monitoring dengan **Prometheus dan Grafana**
- Deployment berbasis container dengan **Docker**
- Mengembangkan fitur AI:
  - **RAG Chatbot** (FastAPI + LlamaIndex + LangChain + GPT-4/LLaMA/Mistral)
  - **Generate Kuis Otomatis** dari materi pembelajaran menggunakan NLP
  - **Koreksi Otomatis Jawaban** menggunakan transformer (BERT/GPT)
  - **Sistem Rekomendasi Pembelajaran** (collaborative filtering)
  - **Speech-to-Text** (Whisper dari OpenAI)
  - **Virtual Assistant** (FastAPI + Rasa NLU, integrasi WhatsApp/Telegram)
- Mengembangkan **Activity Tools** (seperti Notion/ClickUp):
  - Task management dengan automasi
  - AI-powered smart notes
  - Automated workflow & integration (Slack, Google Calendar)
  - Smart time tracking & productivity analytics
  - Meeting scheduler

### Asisten Laboratorium — UTM (Feb–Jul 2023)
- Pemeliharaan komputer dan penanganan error jaringan
- Mengajar praktikum dan membuat modul

### Bangkit Academy 2023 — Machine Learning (Feb–Jul 2023)
- Program intensif oleh Google, Tokopedia, Gojek, Traveloka
- Mempelajari algoritma ML, data processing, dan aplikasi model

### Baparekraf Digital Talent — Machine Learning (Okt–Nov 2022)
- Pelatihan digital skill dari Kemenparekraf

## Proyek Open Source

### qwen-cline
- **Dockerized API service** untuk Qwen AI models
- OpenAI-compatible API interface, support chat generation dan tool-calling
- Kompatibel dengan Cline, n8n (Ollama node), dan OpenAI API clients
- **Tech**: Python, FastAPI, Docker
- **GitHub**: https://github.com/arosyihuddin/qwen-cline

### qwen-api
- **Unofficial Python SDK** untuk Qwen AI models
- Support chat completions, streaming, async calls, file uploads via Aliyun OSS
- **Tech**: Python, httpx, OOP
- **GitHub**: https://github.com/arosyihuddin/qwen-api

### searxng-wrapper
- **Lightweight Python wrapper** untuk SearXNG (privacy-respecting metasearch engine)
- Interface sederhana untuk search queries dan structured results
- **Tech**: Python, OOP
- **GitHub**: https://github.com/arosyihuddin/searxng-wrapper

### Legal NER
- Implementasi **BERT** untuk identifikasi entitas hukum dalam putusan pengadilan Indonesia
- **Demo**: https://huggingface.co/spaces/arosyihuddin/gradio-LegalNER
- **Tech**: Python, PyTorch, Gradio, BERT

### Tani Tama (Capstone Bangkit)
- Model CNN untuk deteksi penyakit tanaman padi
- Memimpin tim 6 orang
- **Tech**: Python, TensorFlow, Docker, Flask

### Proyek Lainnya
- **Sentiment Analysis Surabaya Zoo** — SVM untuk klasifikasi ulasan Google Maps
- **Klasifikasi Harga HP** — KNN, Decision Tree, Naive Bayes dengan Streamlit
- **Koperasi Simpan Pinjam** — Sistem pencatatan surat (Laravel, MySQL)
- **Super Banana** — Sistem pemesanan pisang krispi (Laravel, MySQL)

## Skills & Teknologi
- **Backend**: Node.js, Express, GraphQL, TypeORM, FastAPI, Laravel
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Database**: MySQL, PostgreSQL, Redis
- **AI/ML**: PyTorch, TensorFlow, Scikit-Learn, LlamaIndex, LangChain, OpenAI API
- **DevOps**: Docker, Proxmox, VMware ESXi, Nginx, Cloudflare Tunnel
- **Monitoring**: Prometheus, Grafana
- **Tools**: Git, Linux

Pertanyaan: ${query}
`;
}
