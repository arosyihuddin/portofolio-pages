export function contextData(query: string) {
    return `
    Jawab pertanyaan berikut berdasarkan context di bawah ini
    Context:

    ### **Identitas & Kontak**
    - **Nama**: Ahmad Rosyihuddin
    - **Email**: rosyihuddin.dev@gmail.com
    - **Portofolio**: [arosyihuddin.my.id](https://arosyihuddin.my.id/)
    - **LinkedIn & GitHub**: Tautan tersedia di portofolio.

    ### **Pendidikan**
    - **Universitas Trunojoyo Madura (UTM)**
    - Program: S1 Teknik Informatika (2020–2024)
    - IPK: 3.80/4.0

    ### **Pengalaman Profesional & Proyek**
    1. **Back End Developer**
    ERA Real Estate (Oktober 2024–Saat ini)
    - Mengembangkan solusi software dengan kombinasi machine learning dan software engineering
    2. **Capstone Project: Tani Tama** (Feb–Jul 2023)
    - *Machine Learning Engineer*
    - Memimpin tim 6 orang untuk pengembangan aplikasi deteksi penyakit tanaman padi.
    - Membangun model ML inti menggunakan Scikit-Learn dan PyTorch.
    3. **Bangkit Academy 2023** (Feb–Jul 2023)
    - *Lulusan Program Machine Learning*
    - Berkontribusi pada proyek pengurangan polarisasi politik dengan *web scraping* berita.
    4. **Volunteer di WargaLab**
    - *Laboratory Assistant*: Pemeliharaan komputer, penanganan error jaringan, dan administrasi lab.
    - *Practical Assistant*: Mengajar praktikum, membantu tugas, dan membuat modul praktikum.
    5. **Speaker di UKM Information Technology Center (ITC)** (Sep 2022)
    - Memimpin sesi pengenalan Python untuk anggota UKM dengan pendekatan terstruktur.

    ### **Proyek Pribadi**
    1. **LegalNER (Named Entity Recognition untuk Dokumen Hukum)**
    - Implementasi BERT untuk identifikasi entitas hukum dalam putusan pengadilan Indonesia.
    - **Demo**: [LegalNER on Hugging Face](https://huggingface.co/spaces/arosyihuddin/gradio-LegalNER)

    2. **Klasifikasi Berita dengan Text Rank & SVM**
    - Klasifikasi otomatis berita menggunakan metode Text Rank dan Support Vector Machine (SVM).
    - Diimplementasikan dengan Streamlit.

    3. **Ekstraksi Kata Kunci Berita**
    - Ekstraksi kata kunci berita menggunakan algoritma Text Rank.
    - Diimplementasikan dengan Streamlit.

    ### **Sertifikasi**
    - **TensorFlow Developer Certificate** (Oktober 2023–2026)

    ### **Keterampilan**
    - **Bahasa Pemrograman**: Python, PHP, JavaScript, Node.js, HTML, CSS
    - **Framework & Tools**: Scikit-Learn, TensorFlow, PyTorch, Laravel, Next.js, Git, MySQL
    - **Software**: Microsoft Office, XAMPP, Canva, CorelDraw
    - **Sistem Operasi**: Linux

    ### **Tautan Penting**
    1. Portofolio Resmi: [arosyihuddin.my.id](https://arosyihuddin.my.id/)
    2. Proyek LegalNER: [Hugging Face – LegalNER](https://huggingface.co/spaces/arosyihuddin/gradio-LegalNER)

    Berikut penjelasan lengkap berdasarkan konten situs **https://arosyihuddin.my.id/**, dengan integrasi informasi dari **web_search** untuk memperkaya konteks:

    ### **Profil Utama**
    **Ahmad Rosyihuddin** (dikenal sebagai **Rosik**) adalah seorang *Software Engineer* dan *Machine Learning Enthusiast* dengan latar belakang pendidikan **Teknik Informatika** dari Universitas Trunojoyo Madura (2020–2024). Profilnya mencerminkan kombinasi kemampuan teknis dan minat dalam pengembangan solusi berbasis AI, yang selaras dengan tren *personal branding* yang menekankan nilai diri melalui keahlian spesifik.

    **Posisi dan Peran Profesional**:
    - **Backend Developer di ERA Real Estate (sejak Oktober 2024)**:
    Rosik memiliki pengalaman dalam membangun **API yang efisien dan skalabel**, dengan memanfaatkan berbagai teknologi modern seperti **Node.js, Express, GraphQL, dan MySQL**. Dalam optimasi sistem, Rosik menerapkan **caching menggunakan Redis** yang berguna untuk mempercepat pencarian dan pengelolaan data secara terstruktur.

    Selain teknologi berbasis JavaScript dan TypeScript, Rosik juga mengembangkan berbagai layanan menggunakan **FastAPI**, yang dikenal dengan performa tinggi serta kemudahan dalam membangun aplikasi berbasis **RESTful API** maupun **GraphQL**.

    ## **Pengelolaan Infrastruktur dan Server**
    Di **Era Real Estate**, Rosik bertanggung jawab atas **pemeliharaan (*maintenance*) serta instalasi server** menggunakan **VMware ESXi**. Tanggung jawab ini mencakup:

    - **Instalasi dan konfigurasi server** untuk memastikan performa dan keamanan sistem tetap optimal.
    - **Manajemen sumber daya virtualisasi**, termasuk alokasi CPU, RAM, dan penyimpanan untuk layanan yang berjalan.
    - **Optimasi dan monitoring server** menggunakan **Prometheus dan Grafana** untuk analisis kinerja sistem secara real-time.
    - **Deployment berbasis container** dengan Docker dan Kubernetes untuk mempermudah skalabilitas aplikasi.

    ## **Pengembangan Fitur-Fitur Berbasis AI dan Otomasi**
    Rosik juga mengembangkan berbagai fitur inovatif berbasis **AI dan otomatisasi**. Beberapa fitur yang telah dikerjakan antara lain:

    ### **1. Chatbot dengan Integrasi RAG (Retrieval-Augmented Generation)**
    - Backend menggunakan **FastAPI** untuk layanan chatbot.
    - **LlamaIndex** digunakan untuk mengelola sumber data yang dapat diakses chatbot.
    - **LangChain** untuk memahami konteks percakapan lebih baik.
    - Integrasi dengan model **GPT-4, LLaMA, dan Mistral** untuk respons yang lebih cerdas dan kontekstual.

    ### **2. Generate Kuis Otomatis dari Materi Pembelajaran**
    - Menggunakan **NLP** untuk memahami isi materi dan membuat pertanyaan secara otomatis.
    - Format soal yang dihasilkan mencakup **pilihan ganda, isian singkat, dan soal uraian berbasis kasus**.

    ### **3. Koreksi Otomatis Jawaban Siswa dengan AI**
    - Mampu menilai **soal pilihan ganda** serta **soal uraian** dengan akurasi tinggi.
    - Menggunakan **transformer-based models** seperti **BERT dan GPT** untuk memahami konteks jawaban siswa.
    - Sistem memberikan **feedback otomatis** untuk membantu siswa memahami kesalahan mereka.

    ### **4. Sistem Rekomendasi Pembelajaran**
    - Menganalisis pola belajar siswa untuk memberikan rekomendasi materi yang sesuai.
    - Menggunakan **Machine Learning (ML)** berbasis **collaborative filtering**.

    ### **5. Speech-to-Text untuk Transkripsi Otomatis Kelas Online**
    - Implementasi **Whisper dari OpenAI** untuk transkripsi otomatis.
    - Backend menggunakan **FastAPI** untuk pemrosesan dan penyimpanan hasil transkripsi.

    ### **6. Automated Virtual Assistant untuk Administrasi Akademik**
    - Dibangun dengan **FastAPI dan Rasa NLU** untuk menangani tugas administrasi.
    - Dapat memberikan informasi terkait **jadwal kelas, tugas, dan pengumuman**.
    - Integrasi dengan **WhatsApp dan Telegram menggunakan Twilio API**.

    ## **Pengembangan Produk Activity Tools seperti Notion & ClickUp**
    Selain proyek berbasis AI dan pendidikan, Rosik juga mengembangkan **Activity Tools** yang menyerupai **Notion** dan **ClickUp**, dengan fitur otomasi untuk meningkatkan produktivitas tim dan manajemen proyek.

    ### **1. Task Management dengan Automasi**
    - Pengguna dapat membuat, mengelola, dan melacak **tugas serta proyek** dalam satu platform.
    - Fitur **drag-and-drop task board** seperti di **ClickUp & Trello**.
    - **Automasi tugas** berdasarkan **status, deadline, dan prioritas**.

    ### **2. AI-powered Smart Notes & Knowledge Management**
    - Pengguna dapat menyimpan dan mengorganisir catatan layaknya di **Notion**.
    - **AI otomatis mengelompokkan catatan** berdasarkan konteks dan topik.
    - Dapat menghasilkan **ringkasan otomatis dari dokumen panjang**.

    ### **3. Automated Workflow & Integration**
    - **Automasi tugas dan notifikasi** dengan aturan yang dapat dikustomisasi.
    - Integrasi dengan **Slack, Google Calendar, dan Email** untuk pengingat otomatis.
    - **Webhook API** untuk menghubungkan dengan sistem eksternal.

    ### **4. Smart Time Tracking & Productivity Analytics**
    - AI menganalisis **waktu yang dihabiskan untuk tugas tertentu**.
    - Dashboard dengan **grafik analitik** untuk memantau produktivitas tim.
    - **Estimasi AI untuk penyelesaian tugas** berdasarkan pola kerja sebelumnya.

    ### **5. Sistem Reminder & Meeting Scheduler**
    - **Otomasi pengingat** untuk tugas yang akan datang.
    - **AI-based meeting scheduler** yang merekomendasikan waktu optimal untuk rapat.
    - Sinkronisasi dengan **Google Calendar dan Outlook**.


    ## **Teknologi yang Digunakan dalam Proyek Ini**
    Rosik menggunakan kombinasi beberapa teknologi, antara lain:

    - **Backend Development:** FastAPI (Python), Node.js (Express, TypeORM)
    - **Database Management:** MySQL, PostgreSQL, Redis (untuk caching)
    - **Artificial Intelligence & NLP:** OpenAI GPT, LlamaIndex, LangChain, TensorFlow
    - **Machine Learning & Data Processing:** Pandas, Scikit-learn, Matplotlib
    - **Task Automation & Workflow:** Celery, Apache Airflow
    - **Virtualization & Server Management:** VMware ESXi, Docker, Kubernetes
    - **Monitoring & Logging:** Prometheus, Grafana

    Dengan pengalaman luas dalam **pengembangan API, AI, otomatisasi, serta manajemen infrastruktur**, Rosik terus mengembangkan solusi inovatif yang menggabungkan **efisiensi, kecerdasan buatan, dan otomasi** untuk menciptakan **sistem yang lebih cerdas dan produktif**.

    - **Asisten Laboratorium (2023)**:
    Peran ini tidak hanya melatih keterampilan teknis (pemrograman dan jaringan) tetapi juga manajemen proyek, seperti yang dijelaskan dalam struktur *report text* yang bertujuan menyampaikan informasi berbasis fakta.

    **Kontak dan Portofolio**:
    - Situs pribadi ([arosyihuddin.my.id](https://arosyihuddin.my.id)) dan repositori GitHub menunjukkan transparansi dalam membangun *personal branding*, suatu strategi penting untuk meningkatkan nilai profesional.


    ### **Pengalaman Profesional dan Pelatihan**
    1. **ERA Real Estate**:
    Fokus pada pengembangan *backend* dengan pendekatan modular, mirip struktur *review text* yang terdiri dari *introduction, evaluation, interpretation*, dan *evaluative summation*. Contohnya, desain API-nya mempertimbangkan skalabilitas dan integrasi sistem, yang memerlukan analisis mendalam layaknya proses evaluasi dalam *review text*.

    2. **Bangkit Academy (2023)**:
    Program ini melatihnya dalam algoritma *machine learning* dan aplikasi model, seperti pada proyek **Tani Tama** yang menggunakan CNN untuk prediksi pertanian. Hal ini sejalan dengan konsep *search engine* yang menggabungkan analisis data dan teknologi.

    3. **Baparekraf Digital Talent (2022)**:
    Pelatihan ini memperkuat kemampuannya dalam transformasi digital, terutama dalam menghubungkan teknologi dengan kebutuhan industri kreatif, mirip dengan contoh artikel tentang pengaruh kualitas pelayanan terhadap loyalitas.

    ### **Proyek Terkemuka dan Analisis Teknis**
    1. **Legal NER**:
    - **Tujuan**: Ekstraksi entitas hukum dari dokumen pengadilan menggunakan BERT.
    - **Struktur**: Proyek ini mengikuti pola *report text*, dengan tahap pengamatan data, analisis model, dan penyajian hasil melalui antarmuka Gradio.
    - **Dampak**: Memfasilitasi otomatisasi analisis dokumen legal, yang dapat meningkatkan efisiensi dalam bisnis berbasis kepercayaan.

    2. **Tani Tama Capstone Project**:
    - **Teknologi**: CNN dengan TensorFlow dan Docker untuk deployment.
    - **Konteks**: Proyek ini mencerminkan semangat *entrepreneurship*, karena bertujuan memecahkan masalah pertanian melalui teknologi.

    3. **Analisis Sentimen Surabaya Zoo**:
    - **Metode**: SVM untuk klasifikasi ulasan Google Maps.
    - **Relevansi**: Hasilnya dapat digunakan untuk meningkatkan kualitas layanan, seperti yang dibahas dalam contoh artikel tentang pelayanan bisnis Islami.

    4. **Klasifikasi Harga HP**:
    - **Implementasi**: Menggunakan Streamlit untuk visualisasi, yang mirip dengan contoh artikel interaktif. Proyek ini membandingkan algoritma KNN, Decision Tree, dan Naive Bayes, menunjukkan penguasaan struktur evaluasi

    ### **Keterampilan dan Integrasi Teknologi**
    - **Bahasa Pemrograman**:
    Python dan JavaScript menjadi tulang punggung proyeknya, terutama dalam mengembangkan model ML dan API.
    - **Framework**:
    - **Laravel/PHP**: Digunakan untuk proyek manajemen koperasi, menunjukkan kemampuan dalam *web development* tradisional.
    - **TensorFlow/PyTorch**: Mendukung eksperimen ML, seperti pada proyek Legal NER yang memanfaatkan BERT.
    - **Tools**:
    Docker dan Git menunjukkan adaptasinya terhadap praktik *DevOps*, yang krusial dalam pengembangan sistem modern

    ### **Pendidikan dan Relevansinya dengan Karir**
    Gelar S1 Teknik Informatika memberinya dasar kuat dalam algoritma dan sistem informasi. Proyek akhir seperti **Super Banana** (sistem pemesanan pisang krispi) mencerminkan kemampuan menerapkan teori ke praktik, sesuai dengan tujuan *report text* yang berbasis pengamatan.

    pertanyaan : ${query}
`
}
