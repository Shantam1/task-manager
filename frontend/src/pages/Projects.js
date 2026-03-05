import React, { useEffect, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";

function Projects({ setProject }) {

  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {

    try {
      const res = await API.get("/projects/");
      setProjects(res.data);
    } catch (err) {
      toast.error("Failed to load projects");
    }

  };

  const createProject = async () => {

    if (!name.trim()) {
      toast.error("Project name required");
      return;
    }

    try {

      await API.post("/projects/", {
        name: name
      });

      toast.success("Project created");

      setName("");
      loadProjects();

    } catch (err) {

      const message =
        err.response?.data?.detail ||
        "Project creation failed";

      toast.error(message);

    }

  };

  return (
    <div>

      <h2>Projects</h2>

      <input
        placeholder="Project name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <button onClick={createProject}>
        Create Project
      </button>

      <hr/>

      {projects.map((p)=>(
        <div key={p.id}>
          <button onClick={()=>setProject(p)}>
            {p.name}
          </button>
        </div>
      ))}

    </div>
  );
}

export default Projects;