import React, { useEffect, useState } from "react";
import API from "../api/api";
import Comments from "./Comments";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

function Tasks({ project }) {

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const currentUserId = decoded ? decoded.user_id : null;

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  const loadTasks = async () => {

    try {
      const res = await API.get("/tasks/");
      const filtered = res.data.filter(t => t.project === project.id);
      setTasks(filtered);
    } catch (err) {
      toast.error("Failed to load tasks");
    }

  };

  const loadUsers = async () => {

    try {
      const res = await API.get("/users/");
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load users");
    }

  };

  const createTask = async () => {

    if (!title.trim()) {
      toast.error("Task title required");
      return;
    }

    if (!assignee) {
      toast.error("Select assignee");
      return;
    }

    try {

      await API.post("/tasks/", {
        title,
        description,
        project: project.id,
        assignee: assignee,
        status: "todo"
      });

      toast.success("Task created");

      setTitle("");
      setDescription("");
      setAssignee("");

      loadTasks();

    } catch (err) {

      const message =
        err.response?.data?.detail ||
        "Task creation failed";

      toast.error(message);

    }

  };

  const updateStatus = async (task, status) => {

    try {

      await API.patch(`/tasks/${task.id}/`, {
        status: status
      });

      toast.success("Task updated");

      loadTasks();

    } catch (err) {

      const message =
        err.response?.data?.detail ||
        "Status update failed";

      toast.error(message);

    }

  };

  return (
    <div>

      <h2>Tasks for {project.name}</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <select
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
      >

        <option value="">Select Assignee</option>

        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username}
          </option>
        ))}

      </select>

      <button onClick={createTask}>
        Create Task
      </button>

      <hr />

      {tasks.map((task) => (
        <div
          key={task.id}
          style={{
            border: "1px solid gray",
            margin: "10px",
            padding: "10px"
          }}
        >

          <b>{task.title}</b>

          <p>{task.description}</p>

          Status: {task.status}

          <br />

          {task.status === "todo" && (
            <button onClick={() => updateStatus(task, "in_progress")}>
              Start Task
            </button>
          )}
          {task.status === "in_progress" &&
            (task.assignee === currentUserId || project.owner === currentUserId) && (
              <button onClick={() => updateStatus(task, "done")}>
                Mark Done
              </button>
            )}

          {task.status === "done" && (
            <span>✅ Completed</span>
          )}

          <Comments taskId={task.id} />

        </div>
      ))}

    </div>
  );
}

export default Tasks;