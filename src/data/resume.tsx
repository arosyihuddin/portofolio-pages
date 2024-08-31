import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon, Code, NotebookPen } from "lucide-react";

export const DATA = {
  name: "Ahmad Rosyihuddin",
  initials: "AR",
  url: "https://rosyihuddin.tech",
  location: "East Java, Indonesia",
  locationLink: "#",
  description:
    "Bangkit Academy 2023 Machine Learning Graduates. Graduate of Informatics Engineering from Trunojoyo Madura University. Machine Learning Enthusiast. Software Engineer",
  summary:
    "As an upcoming graduate in Informatics Engineering from Universitas Trunojoyo Madura, my journey has been rich with hands-on experience, notably as a Student Laboratory Assistant where I honed my project management skills. Our team facilitated programming education, ensuring students grasped complex concepts efficiently. My passion for machine learning was further ignited through specialized training at Bangkit Academy and Baparekraf Digital Talent, empowering me with a robust understanding of AI applications. Complementing this is my proficiency in Microsoft Office, which has been instrumental in managing projects and streamlining workflows.",
  avatarUrl: "/me.jpeg",
  skills: [
    "Python",
    "PHP",
    "JavaScript",
    "Node JS",
    "HTML",
    "CSS",
    "Linux",
    "Git",
    "MySQL",
    "Laravel",
    "Next JS",
    "Scikit-Learn",
    "PyTorch",
    "Tensorflow",
    "Docker",
    "Matplotlib",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    // { href: "/blog", icon: NotebookIcon, label: "Blog" },
    { href: "/projects", icon: Code, label: "Projects" },
    { href: "/notes", icon: NotebookPen, label: "Notes" },
  ],
  contact: {
    email: "rosyihuddin.dev@gmail.com",
    tel: "+123456789",
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
      company: "Student Laboratory Assistant",
      href: "https://www.trunojoyo.ac.id/",
      badges: [],
      location: "Remote",
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
      title: "Legal NER",
      href: "https://huggingface.co/spaces/arosyihuddin/gradio-LegalNER",
      dates: "Mar 2024 - Jul 2024",
      active: true,
      description:
        "This application implements BERT to automatically identify legal entities in Indonesian court decision documents. The system is designed to facilitate the extraction of entities such as names, institutions, and legal terms, which are important in the processing and analysis of legal documents.",
      technologies: [
        "Python",
        "PyTorch",
        "Gradio",
        "BERT",
      ],
      links: [
        {
          type: "Website",
          href: "https://huggingface.co/spaces/arosyihuddin/gradio-LegalNER",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/legalNER.png",
      video: ""
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
          type: "Source",
          href: "https://github.com/Bangkit-Capstone-C23-PC639",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/tanitama.png",
      video: ""
    },
    {
      title: "Sentiment Analysis of Surabaya Zoo",
      href: "https://github.com/arosyihuddin/sentimen-analisis-kebun-binatang-surabaya",
      dates: "Mei 2023",
      active: true,
      description:
        "This project is a college assignment from my friend, I was told to help make it so I helped make the code only without implementing it into the website. this project is entitled sentiment analysis of Surabaya zoo reviews using Support Vector Machine (SVM). the dataset used itself from Google Maps reviews, the data is taken by crawling.",
      technologies: [
        "Numpy",
        "Pandas",
        "Matplotlib",
        "Python",
        "Scikit-Learn",
      ],
      links: [
        {
          type: "Source",
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
      technologies: [
        "Laravel",
        "Mysql",
        "Bootstrap",
        "JQuery"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/arosyihuddin/Koperasi-Simpan-Pinjam",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/koperasi.png",
      video: ""
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
          type: "Source",
          href: "https://github.com/arosyihuddin/streamlit-datamining",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/datamining.png",
      video: ""
    },
    {
      title: "Super Banana",
      href: "https://github.com/arosyihuddin/Super-Pisang",
      dates: "March 2020",
      active: true,
      description:
        "Super Banana is a final project of the Software Project course, this project is done in groups of 4 people. This project raises the problem of a krispi banana seller who is very in demand so that many of the consumers have to queue very long resulting in consumers being bored waiting for it. therefore a krispi banana purchasing system was made called super banana, with this system consumers can buy krispi bananas from their boarding house without having to be bored waiting for orders. making this system using PHP version 8 and also laravel version 9.",
      technologies: [
        "Laravel",
        "Mysql",
        "Bootstrap",
        "JQuery"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/arosyihuddin/Super-Pisang",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/super pisang.png",
      video: ""
    },
  ],
  notes: [
    {
      title: "Thesis",
      dates : "27 Jul 2024",
      description: "Coming Soon",
      location: "Trunojoyo University",
      links: [
        {
          title: "Source",
          icon: <Icons.github className="h-4 w-4" />,
          href: "#"
        },
      ],
      image:"/utm.png"
    }
  ]
} as const;
