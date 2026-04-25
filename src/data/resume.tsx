import { Icons } from "@/components/icons";
import {
  HomeIcon,
  NotebookIcon,
  Code,
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
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
    { href: "https://rlabs.arosyihuddin.com/", icon: Code, label: "Projects" },
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

        navbar: false,
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
  projectsUrl: "https://rlabs.arosyihuddin.com/",
} as const;
