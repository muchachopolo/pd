import { Component, signal, HostListener, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger, state } from '@angular/animations';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-60px)' }),
        animate('700ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('fadeInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(60px)' }),
        animate('700ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('navSlide', [
      state('hidden', style({ transform: 'translateY(-100%)' })),
      state('visible', style({ transform: 'translateY(0)' })),
      transition('hidden <=> visible', animate('300ms ease-in-out'))
    ]),
    trigger('bounceIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.3)' }),
        animate('600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('flipIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'perspective(400px) rotateY(90deg)' }),
        animate('800ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'perspective(400px) rotateY(0)' }))
      ])
    ])
  ]
})
export class App implements OnInit, AfterViewInit {
  @ViewChildren('animSection') animSections!: QueryList<ElementRef>;

  // ---- EmailJS config: replace with your real IDs ----
  private emailjsServiceId = 'service_sapchro';
  private emailjsTemplateId = 'template_kh9vnao';
  private emailjsPublicKey = '8ZtL4Db6D_2WA0nv6';

  activeSection = signal('hero');
  navVisible = signal(true);
  lastScrollY = 0;
  mobileMenuOpen = signal(false);

  visibleSections = signal<Set<string>>(new Set());

  contactForm = signal({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  formSubmitted = signal(false);
  formSending = signal(false);
  formError = signal('');

  typedText = signal('');
  private fullTexts = [
    'AI System Architect',
    'Software Architect',
    'AI Agent Orchestration Specialist',
    'Full-Stack Developer'
  ];
  private textIndex = 0;
  private charIndex = 0;
  private isDeleting = false;

  particlePositions = signal<Array<{x: number, y: number, size: number, duration: number, delay: number}>>([]);

  sections = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' }
  ];

  skillCategories = [
    {
      icon: 'fa-brain',
      title: 'AI & LLM Technologies',
      skills: ['Claude (Opus, Sonnet, Haiku)', 'GPT-4o', 'Gemini', 'LLaMA', 'RAG Architectures', 'Prompt Engineering', 'Multi-Agent Orchestration', 'MCP Servers', 'Tool Use / Function Calling', 'Embeddings & Vector Search', 'Fine-tuning']
    },
    {
      icon: 'fa-robot',
      title: 'AI Agent & Automation',
      skills: ['Claude Agent SDK', 'LangChain', 'LangGraph', 'CrewAI', 'MCP (Model Context Protocol)', 'GitHub Actions', 'CI/CD Pipelines', 'Playwright', 'Selenium']
    },
    {
      icon: 'fa-code',
      title: 'Development',
      skills: ['Python', 'C#', 'TypeScript', 'Java', 'Angular', 'React', 'Node.js', '.NET Core', 'PHP', 'Laravel', 'Ruby on Rails']
    },
    {
      icon: 'fa-cloud',
      title: 'Cloud & Infrastructure',
      skills: ['AWS (Lambda, SageMaker, Bedrock)', 'Azure (OpenAI Service, DevOps)', 'GCP (Vertex AI)', 'Docker', 'Kubernetes', 'Terraform', 'Serverless']
    },
    {
      icon: 'fa-database',
      title: 'Databases',
      skills: ['PostgreSQL', 'MySQL', 'SQL Server', 'MongoDB', 'Redis', 'Pinecone', 'ChromaDB', 'Entity Framework', 'JPA']
    },
    {
      icon: 'fa-tools',
      title: 'Tools & DevOps',
      skills: ['Claude Code CLI', 'Cursor', 'VS Code', 'Docker', 'Jenkins', 'GitHub Actions', 'Grafana', 'Git', 'Jira', 'Confluence']
    }
  ];

  experiences = [
    {
      period: 'Jan 2026 - Present',
      position: 'AI System Architect',
      company: 'Nice CXone',
      current: true,
      highlights: [
        'Designed and implemented end-to-end AI agent orchestration system automating the full SDLC from Jira ticket intake to production deployment.',
        'Architected multi-agent pipelines using Claude and MCP servers to enable AI agents to interact with Jira, Confluence, Grafana, GitHub, and CI/CD systems.',
        'Built intelligent Jira-to-code automation: AI agents parse requirements, generate plans, produce code with tests, create PRs, and manage review cycles.',
        'Integrated AI-driven observability with Grafana, Loki, and Prometheus for automated incident detection and self-healing responses.',
        'Developed custom MCP server integrations for Atlassian and Grafana across multiple environments.',
        'Implemented RAG pipelines with vector databases for context-aware code generation.',
        'Led adoption of Claude Code CLI and AI-assisted development across engineering teams.',
        'Built automated quality gates with AI-driven static analysis, test generation, and code review.',
        'Established AI governance: prompt versioning, output validation, human-in-the-loop checkpoints, and audit trails.'
      ]
    },
    {
      period: '2020 - 2025',
      position: 'Lead Software Developer / Principal Software Developer / Architect',
      company: 'Nice CXone (formerly NICE inContact)',
      current: false,
      highlights: [
        'C# backend developer across multiple teams.',
        'Angular frontend developer across multiple teams.',
        'Advanced use of ASP.NET Core and Entity Framework.',
        'DevOps procedures using Jenkins with Docker agents.',
        'Research and implementation of design patterns and architectural definitions for testability and maintainability.'
      ]
    },
    {
      period: '2019',
      position: 'Lead Software Developer',
      company: 'AssureSoft',
      current: false,
      highlights: [
        'Project Team Leader for Java development.',
        'Architect and design implementation for Spring Boot apps.',
        'Advanced JPA and Hibernate with OOP design patterns and DI.',
        'DevOps procedures using Bamboo with VM agents.'
      ]
    },
    {
      period: '2018 - 2019',
      position: 'Software Developer II',
      company: 'AssureSoft',
      current: false,
      highlights: [
        'Zendesk Channel Integration Team Leader.',
        'Architecture and design for Zendesk Channel Integrations.',
        'Full-stack development with AngularJS, PHP, Angular, and Laravel.'
      ]
    },
    {
      period: '2010 - 2017',
      position: 'IT Manager / Software Developer / Electronic Design Developer',
      company: 'Proteccion UNO',
      current: false,
      highlights: [
        'Active Directory, Exchange, Remote Desktop Services management.',
        'Software development with WPF, C#, Xamarin.',
        'Electronic security expert with multiple certifications.'
      ]
    }
  ];

  education = [
    { year: '2019 - 2021', title: "Master's Degree - Software Information Technologies & Data Management", institution: 'Universidad Privada del Valle', description: 'Machine learning, big data, deep learning, NLP, and data pipeline architectures.' },
    { year: '2007 - 2015', title: 'Electronic and Computer Science Engineer', institution: 'Universidad Privada del Valle', description: 'Full engineering degree in electronics and computer science.' },
    { year: '2017', title: 'Post-degree: Robotics & Wireless Communication', institution: 'Universidad Privada del Valle', description: 'Mobile robotics, manipulator robotics, wireless devices.' }
  ];

  certifications = [
    { year: '2026', title: 'AI System Architecture & Multi-Agent Orchestration', source: 'Self-directed & Industry Training' },
    { year: '2025', title: 'Anthropic Claude API & Claude Code', source: 'Anthropic Developer Program' },
    { year: '2025', title: 'AWS Solutions Architect - AI/ML Specialty', source: 'Amazon Web Services' },
    { year: '2024', title: 'LangChain & LangGraph for Production AI', source: 'DeepLearning.AI' },
    { year: '2024', title: 'Prompt Engineering & Advanced AI Techniques', source: 'DeepLearning.AI / Anthropic' },
    { year: '2020', title: 'C# ASP.NET Core Architect Path', source: 'Pluralsight' },
    { year: '2020', title: 'Angular Architect Path', source: 'Pluralsight' },
    { year: '2020', title: 'Microchip Wireless Communications (IoT)', source: 'Microchip Argentina' },
    { year: '2017', title: 'OOP Software Development & Design Patterns', source: 'Tekhne' },
    { year: '2009 - 2011', title: 'CCNA Certification (Networking)', source: 'Tekhne' }
  ];

  stats = [
    { value: '8+', label: 'Years Experience' },
    { value: '4+', label: 'Companies' },
    { value: '20+', label: 'Technologies' },
    { value: 'MSc', label: 'Degree' }
  ];

  ngOnInit() {
    this.generateParticles();
    this.typeWriter();
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  generateParticles() {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 10
      });
    }
    this.particlePositions.set(particles);
  }

  typeWriter() {
    const current = this.fullTexts[this.textIndex];
    if (!this.isDeleting) {
      this.typedText.set(current.substring(0, this.charIndex + 1));
      this.charIndex++;
      if (this.charIndex === current.length) {
        setTimeout(() => {
          this.isDeleting = true;
          this.typeWriter();
        }, 2000);
        return;
      }
    } else {
      this.typedText.set(current.substring(0, this.charIndex - 1));
      this.charIndex--;
      if (this.charIndex === 0) {
        this.isDeleting = false;
        this.textIndex = (this.textIndex + 1) % this.fullTexts.length;
      }
    }
    setTimeout(() => this.typeWriter(), this.isDeleting ? 50 : 100);
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const id = entry.target.getAttribute('id') || '';
          if (entry.isIntersecting) {
            this.visibleSections.update(s => { s.add(id); return new Set(s); });
            if (entry.intersectionRatio > 0.3) {
              this.activeSection.set(id);
            }
          }
        });
      },
      { threshold: [0.1, 0.3] }
    );

    this.animSections.forEach(section => {
      observer.observe(section.nativeElement);
    });
  }

  isSectionVisible(id: string): boolean {
    return this.visibleSections().has(id);
  }

  @HostListener('window:scroll')
  onScroll() {
    const currentScrollY = window.scrollY;
    this.navVisible.set(currentScrollY < this.lastScrollY || currentScrollY < 100);
    this.lastScrollY = currentScrollY;
  }

  scrollTo(sectionId: string) {
    this.mobileMenuOpen.set(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  updateFormField(field: string, value: string) {
    this.contactForm.update(f => ({ ...f, [field]: value }));
  }

  async submitForm() {
    const form = this.contactForm();
    if (!form.name || !form.email || !form.message) {
      this.formError.set('Please fill in all required fields.');
      return;
    }

    this.formSending.set(true);
    this.formError.set('');

    try {
      await emailjs.send(
        this.emailjsServiceId,
        this.emailjsTemplateId,
        {
          from_name: form.name,
          from_email: form.email,
          subject: form.subject || 'Contact from Portfolio',
          message: form.message,
          to_email: 'aketza.daza@me.com'
        },
        this.emailjsPublicKey
      );
      this.formSubmitted.set(true);
    } catch {
      this.formError.set('Failed to send. Opening your email client instead...');
      const mailtoLink = `mailto:aketza.daza@me.com?subject=${encodeURIComponent(form.subject || 'Contact from Portfolio')}&body=${encodeURIComponent(`From: ${form.name} (${form.email})\n\n${form.message}`)}`;
      window.location.href = mailtoLink;
    } finally {
      this.formSending.set(false);
    }
  }

  resetForm() {
    this.contactForm.set({ name: '', email: '', subject: '', message: '' });
    this.formSubmitted.set(false);
    this.formError.set('');
    this.formSending.set(false);
  }

  getExpIcon(company: string): string {
    if (company.toLowerCase().includes('nice')) return 'fa-building';
    if (company.toLowerCase().includes('assure')) return 'fa-laptop-code';
    if (company.toLowerCase().includes('protec')) return 'fa-shield-halved';
    return 'fa-briefcase';
  }
}
