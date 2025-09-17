import { Icons } from "@/components/icons";
import {
  HomeIcon,
  NotebookIcon,
  Code,
  NotebookPen,
  BotMessageSquare,
} from "lucide-react";

export const DATA = {
  name: "Ahmad Rosyihuddin",
  initials: "AR",
  url: "https://arosyihuddin.my.id",
  location: "East Java, Indonesia",
  locationLink: "#",
  description: "Software Engineer & Machine Learning Enthusiast",
  summary:
    "Experienced Software Engineer and AI Infrastructure Builder, specializing in scalable backend systems and intelligent automation. Skilled in Node.js, FastAPI, MySQL, PostgreSQL, Redis, and TypeORM, with hands-on experience deploying self-hosted infrastructure (Docker, Cloudflare Tunnel, Nginx, ESXi). \n\nCurrently exploring advanced AI integrations, including custom multi-agent RAG pipelines and LLM tool-calling workflows. Author of **[qwen-api](https://github.com/arosyihuddin/qwen-api)** (unofficial Python SDK for Qwen AI) and **[qwen-cline](https://github.com/arosyihuddin/qwen-cline)** (Dockerized API for Cline, n8n, and OpenAI clients). \n\nPassionate about improving developer experience, building automation pipelines, and bridging backend engineering with practical AI applications.",
  avatarUrl: "/me.jpeg",
  skills: [
    "Node JS",
    "Express JS",
    "TypeScript",
    "GraphQL",
    "PostgreSQL",
    "Rest API",
    "Next JS",
    "Python",
    "PyTorch",
    "Tensorflow",
    "Linux",
    "Docker",
    "Git",
    "Proxmox & Esxi Server",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    // { href: "/blog", icon: NotebookIcon, label: "Blog" },
    { href: "/projects", icon: Code, label: "Projects" },
    // { href: "/notes", icon: NotebookPen, label: "Notes" },
    { href: "/chat", icon: BotMessageSquare, label: "Assistant" },
  ],
  contact: {
    email: "rosyihuddin.dev@gmail.com",
    // tel: "+123456789",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/arosyihuddin",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/ahmad-rosyihuddin/",
        icon: Icons.linkedin,

        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com/a_rosyihuddin",
        icon: Icons.x,

        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "rosyihuddin.dev@gmail.com",
        icon: Icons.email,

        navbar: true,
      },
    },
  },

  work: [
    {
      company: "Era Real Estate",
      href: "https://eraindonesia.com/",
      badges: [],
      location: "On-Site",
      title: "Backend Development",
      logoUrl: "/logoera.png",
      start: "Oct 2024",
      end: "Present",
      description:
        "As a Backend Developer at ERA Kita Surabaya, I specialize in creating efficient server-side applications using Node.js, Express, GraphQL, and TypeORM. My role involves designing and implementing robust APIs, optimizing database interactions with MySQL, and leveraging Redis for caching to enhance system performance. Collaborating with cross-functional teams, I ensure seamless integration between backend systems and client-facing applications, all while maintaining scalability and reliability in an on-site environment.",
    },
    {
      company: "Student Laboratory Assistant",
      href: "https://www.trunojoyo.ac.id/",
      badges: [],
      location: "On-Site",
      title: "Web Development",
      logoUrl: "/utm.png",
      start: "Feb 2023",
      end: "Jul 2023",
      description:
        "Participate in computer maintenance and network fault resolution, while also serving as an administrator in the laboratory. Teach students based on practicum modules, assist with assignments or reports, and create assignments.",
    },
    {
      company: "Bangkit Academy led by Google, Tokopedia, Gojek, & Traveloka",
      href: "https://grow.google/intl/id_id/bangkit/?tab=machine-learning",
      badges: [],
      location: "Remote",
      title: "Machine Learning",
      logoUrl: "/bangkit.jpg",
      start: "Feb 2023",
      end: "Jul 2023",
      description:
        "Bangkit Academy is an intensive training program supported by Google and other partners, which aims to develop skills in the field of technology. In the field of Machine Learning, Bangkit Academy offers a curriculum that includes a deep understanding of machine learning algorithms, data processing, and the application of models in various industries. The program is designed to equip participants with the practical skills and technical knowledge needed for a career in Machine Learning.",
    },
    {
      company: "Baparekraf Digital Talent (BDT)",
      href: "https://bdd.kemenparekraf.go.id/",
      badges: [],
      location: "Remote",
      title: "Machine Learning",
      logoUrl: "/baparekraf.jpeg",
      start: "Oct 2022",
      end: "Nov 2022",
      description:
        "Baparekraf Digital Talent (BDT) is a training program by the Ministry of Tourism and Creative Economy to improve the digital skills of creative industry players. The program includes training in design, app development, and digital marketing to support digital transformation in the tourism and creative economy sectors.",
    },
  ],

  education: [
    {
      school: "Trunojoyo University",
      href: "https://www.trunojoyo.ac.id/",
      degree: "Bachelor's Degree in Informatics Engineering",
      logoUrl: "/utm.png",
      start: "2020",
      end: "2024",
    },
  ],
  projects: [
    {
      title: "Qwen-Cline",
      href: "https://github.com/arosyihuddin/qwen-cline",
      dates: "Mei 2026 - Present",
      active: true,
      description:
        "**qwen-cline** is a **Dockerized API service** for Qwen AI models, designed for easy integration with multiple platforms. It provides an OpenAI-compatible API interface, supporting both chat generation and tool-calling workflows. Compatible with **Cline**, **n8n** (via Ollama node), and any client that uses the OpenAI API format.",
      technologies: ["Python", "FastAPI", "Docker"],
      links: [
        {
          type: "Github",
          href: "https://github.com/arosyihuddin/qwen-cline",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/qwen-cline.jpeg",
      video: "",
    },
    {
      title: "Qwen-API",
      href: "https://github.com/arosyihuddin/qwen-api",
      dates: "Mei 2025 - Present",
      active: true,
      description:
        "**qwen-api** is an **unofficial Python SDK** for interacting with Qwen AI models. It supports chat completions, streaming responses, asynchronous calls, and file uploads via Aliyun OSS with HMAC v4 authentication. Designed to be easily integrated into backend services and automation workflows.",
      technologies: ["Python", "httpx", "OOP"],
      links: [
        {
          type: "Github",
          href: "https://github.com/arosyihuddin/qwen-api",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/qwen-api.jpeg",
      video: "",
    },
    {
      title: "Searxng-Wrapper",
      href: "https://github.com/arosyihuddin/searxng-wrapper",
      dates: "Mei 2026 - Present",
      active: true,
      description:
        "**searxng-wrapper** is a **lightweight Python wrapper** for interacting with [SearXNG](https://docs.searxng.org/) — a powerful, privacy-respecting metasearch engine. It provides a simple interface for performing search queries and retrieving results in a structured format, making it easy to integrate SearXNG into Python scripts, backend services, or automation workflows.",
      technologies: ["Python", "OOP"],
      links: [
        {
          type: "Github",
          href: "https://github.com/arosyihuddin/searxng-wrapper",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/searxng-wrapper.jpeg",
      video: "",
    },
    {
      title: "Legal NER",
      href: "https://huggingface.co/spaces/arosyihuddin/gradio-LegalNER",
      dates: "Mar 2024 - Jul 2024",
      active: true,
      description:
        "This application implements BERT to automatically identify legal entities in Indonesian court decision documents. The system is designed to facilitate the extraction of entities such as names, institutions, and legal terms, which are important in the processing and analysis of legal documents.",
      technologies: ["Python", "PyTorch", "Gradio", "BERT"],
      links: [
        {
          type: "Website",
          href: "https://huggingface.co/spaces/arosyihuddin/gradio-LegalNER",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/legalNER.png",
      video: "",
    },
    {
      title: "Tani Tama Capstone Project",
      href: "https://github.com/Bangkit-Capstone-C23-PC639",
      dates: "Mei 2023 - Jul 2023",
      active: true,
      description:
        "In the Bangkit program, I developed a Convolutional Neural Networks (CNN) based Machine Learning model for the C23-PC369 project. My responsibilities included designing and training the CNN model and creating API endpoints using Flask for integrating the model into applications. This experience enhanced my skills in Machine Learning and web-based system development.",
      technologies: [
        "Python",
        "Tensorflow",
        "Pandas",
        "Numpy",
        "Docker",
        "Flask",
      ],
      links: [
        {
          type: "Github",
          href: "https://github.com/Bangkit-Capstone-C23-PC639",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/tanitama.png",
      video: "",
    },
    {
      title: "Sentiment Analysis of Surabaya Zoo",
      href: "https://github.com/arosyihuddin/sentimen-analisis-kebun-binatang-surabaya",
      dates: "Mei 2023",
      active: true,
      description:
        "This project is a college assignment from my friend, I was told to help make it so I helped make the code only without implementing it into the website. this project is entitled sentiment analysis of Surabaya zoo reviews using Support Vector Machine (SVM). the dataset used itself from Google Maps reviews, the data is taken by crawling.",
      technologies: ["Numpy", "Pandas", "Matplotlib", "Python", "Scikit-Learn"],
      links: [
        {
          type: "Github",
          href: "https://github.com/arosyihuddin/sentimen-analisis-kebun-binatang-surabaya",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/sentimen analisis.png",
      video: "",
    },
    {
      title: "Record Keeping System of Savings and Loan Cooperative",
      href: "https://github.com/arosyihuddin/Koperasi-Simpan-Pinjam",
      dates: "March 2023",
      active: true,
      description:
        "This project is a request from my brother who works at a savings and loan cooperative in my home area. the system in this project can create letters by simply inputting the data through the form so that the letter is ready to print. the creation itself uses PHP version 8 and Laravel Version 9.",
      technologies: ["Laravel", "Mysql", "Bootstrap", "JQuery"],
      links: [
        {
          type: "Github",
          href: "https://github.com/arosyihuddin/Koperasi-Simpan-Pinjam",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/koperasi.png",
      video: "",
    },
    {
      title: "Price Range Classification Based on Mobile Phone Specifications",
      href: "https://datamining-uas.streamlit.app/",
      dates: "Des 2022",
      active: true,
      description:
        "This project is the final project of the Datamining course with the title Classification of Price Ranges Based on Mobile Phone Specifications using 3 methods namely KNN, Decission Tree, and Naive Bayes. and implemented using the Streamlit library.",
      technologies: [
        "Streamlit",
        "Numpy",
        "Pandas",
        "Matplotlib",
        "Python",
        "Scikit-Learn",
      ],
      links: [
        {
          type: "Website",
          href: "https://datamining-uas.streamlit.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Github",
          href: "https://github.com/arosyihuddin/streamlit-datamining",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/datamining.png",
      video: "",
    },
    {
      title: "Super Banana",
      href: "https://github.com/arosyihuddin/Super-Pisang",
      dates: "March 2020",
      active: true,
      description:
        "Super Banana is a final project of the Software Project course, this project is done in groups of 4 people. This project raises the problem of a krispi banana seller who is very in demand so that many of the consumers have to queue very long resulting in consumers being bored waiting for it. therefore a krispi banana purchasing system was made called super banana, with this system consumers can buy krispi bananas from their boarding house without having to be bored waiting for orders. making this system using PHP version 8 and also laravel version 9.",
      technologies: ["Laravel", "Mysql", "Bootstrap", "JQuery"],
      links: [
        {
          type: "Github",
          href: "https://github.com/arosyihuddin/Super-Pisang",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/super pisang.png",
      video: "",
    },
  ],
  notes: [
    {
      title: "Thesis",
      dates: "27 Jul 2024",
      description: "Coming Soon",
      location: "Trunojoyo University",
      links: [
        {
          title: "Source",
          icon: <Icons.github className="h-4 w-4" />,
          href: "#",
        },
      ],
      image: "/utm.png",
    },
  ],
} as const;
