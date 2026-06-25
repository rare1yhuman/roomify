import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import {ArrowRight, ArrowUpRight, Clock, Github, Layers} from "lucide-react";
import Upload from "../../components/Upload";
import {useNavigate, useOutletContext} from "react-router";
import {useEffect, useRef, useState} from "react";
import {createProject, getProjects} from "../../lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Roomify | AI Architectural Visualization" },
    {
        name: "description",
        content: "Transform 2D floor plans into polished 3D architectural renders with Roomify.",
    },
  ];
}

export default function Home() {
    const navigate = useNavigate();
    const { isSignedIn, userName } = useOutletContext<AuthContext>();
    const [projects, setProjects] = useState<DesignItem[]>([]);
    const pendingProjectRef = useRef<Promise<boolean> | null>(null);

    const handleUploadComplete = (base64Image: string): Promise<boolean> => {
        if (pendingProjectRef.current) return pendingProjectRef.current;

        const pendingProject = (async () => {
            try {
                const newId = Date.now().toString();
                const name = `Residence ${newId}`;

                const newItem = {
                    id: newId, name, sourceImage: base64Image,
                    renderedImage: undefined,
                    timestamp: Date.now()
                }

                const saved = await createProject({ item: newItem, visibility: 'private' });

                if(!saved) {
                    console.error("Failed to create project");
                    return false;
                }

                setProjects((prev) => [saved, ...prev]);

                navigate(`/visualizer/${newId}`, {
                    state: {
                        initialImage: saved.sourceImage,
                        initialRendered: saved.renderedImage || null,
                        name
                    }
                });

                return true;
            } finally {
                pendingProjectRef.current = null;
            }
        })();

        pendingProjectRef.current = pendingProject;
        return pendingProject;
    }

    useEffect(() => {
        let isMounted = true;

        if (!isSignedIn) {
            setProjects([]);
            return () => {
                isMounted = false;
            };
        }

        const fetchProjects = async () => {
            const items = await getProjects();

            if (isMounted) setProjects(items)
        }

        void fetchProjects();

        return () => {
            isMounted = false;
        };
    }, [isSignedIn]);

  return (
      <div className="home">
          <Navbar />

          <section className="hero">
              <div className="announce">
                  <div className="dot">
                      <div className="pulse"></div>
                  </div>

                  <p>AI-powered architectural visualization</p>
              </div>

              <h1>Build beautiful spaces at the speed of thought with Roomify</h1>

              <p className="subtitle">
                  Roomify is an AI-first design environment that helps you visualize, render, and ship architectural projects faster  than ever.
              </p>

              <div className="actions">
                  <a href="#upload" className="cta">
                      Start Building <ArrowRight className="icon" />
                  </a>

                  <a
                      href="https://github.com/rare1yhuman/roomify"
                      target="_blank"
                      rel="noreferrer"
                      className="demo"
                  >
                      View Source <Github className="icon" />
                  </a>
              </div>

              <div id="upload" className="upload-shell">
                <div className="grid-overlay" />

                  <div className="upload-card">
                      <div className="upload-head">
                          <div className="upload-icon">
                              <Layers className="icon" />
                          </div>

                          <h3>Upload your floor plan</h3>
                          <p>Supports JPEG, PNG, and WebP files up to 10 MB</p>
                      </div>

                      <Upload onComplete={handleUploadComplete} />
                  </div>
              </div>
          </section>

          <section id="projects" className="projects">
              <div className="section-inner">
                  <div className="section-head">
                      <div className="copy">
                          <h2>Projects</h2>
                          <p>Your latest work and shared community projects, all in one place.</p>
                      </div>
                  </div>

                  <div className="projects-grid">
                      {projects.map(({id, name, renderedImage, sourceImage, timestamp, isPublic, sharedBy}) => (
                          <div key={id} className="project-card group" onClick={() => navigate(`/visualizer/${id}`)}>
                              <div className="preview">
                                  <img src={renderedImage || sourceImage} alt={`${name || "Untitled project"} preview`}
                                  />

                                  <div className="badge">
                                      <span>{isPublic ? "Public" : "Private"}</span>
                                  </div>
                              </div>

                              <div className="card-body">
                                  <div>
                                      <h3>{name || "Untitled project"}</h3>

                                      <div className="meta">
                                          <Clock size={12} />
                                          <span>{new Date(timestamp).toLocaleDateString()}</span>
                                          <span>By {sharedBy || userName || "You"}</span>
                                      </div>
                                  </div>
                                  <div className="arrow">
                                      <ArrowUpRight size={18} />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </section>
      </div>
  )
}
