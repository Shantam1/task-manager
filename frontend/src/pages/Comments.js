import React, { useEffect, useState } from "react";
import API from "../api/api";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

function Comments({ taskId }) {

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (taskId) {
      loadComments();
    }
  }, [taskId]);

  const loadComments = async () => {

    try {

      const res = await API.get("/comments/");
      const filtered = res.data.filter(c => c.task === taskId);
      setComments(filtered);

    } catch (err) {

      toast.error("Failed to load comments");

    }
  };

  const addComment = async () => {

    if (!text.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {

      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const userId = decoded.user_id;

      await API.post("/comments/", {
        task: taskId,
        text: text,
        user: userId
      });

      toast.success("Comment added");

      setText("");
      loadComments();

    } catch (err) {

      const message =
        err.response?.data?.detail ||
        "Failed to add comment";

      toast.error(message);

    }
  };

  return (
    <div style={{ marginTop: "10px" }}>

      <h4>Comments</h4>

      {comments.map((c) => (
        <div key={c.id}>
          {c.text}
        </div>
      ))}

      <input
        placeholder="Add comment"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={addComment}>
        Add
      </button>

    </div>
  );
}

export default Comments;