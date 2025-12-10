import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./BoardView.css";
import BoardCard from "../../components/BoardCard.tsx";
import Button from "@mui/material/Button";
import { Typography, Box, IconButton, TextField } from "@mui/material";
import Task from "../../components/Task.tsx";
import AddTask from "../../components/AddTask.tsx";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import Check from "@mui/icons-material/Check";
import TaskList from "../../components/TaskList.tsx";

export default function BoardView() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [layer, setLayer] = useState(0);
  const [boardStack, setBoardStack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const onTaskRefresh = () => {
    setRefreshVersion(v => v + 1);  // increment token
  };

  const onClickSubtask = (taskId) => {
    fetchTaskBoard(taskId);
  }


  // Used to spawn a board card.
  // Both board and task data structures can be passed in for `board`, as both have title and tasks fields
  const spawnBoardCard = (board, top) => {
    // Push all previous layers back
    

    setBoardStack(prev =>
      [
        ...prev.map(b => ({
          ...b,
          layer: b.layer + 1   // Increment layer for all existing boards
        })),
        board
      ]
    );

    // This will animate the boardCard sliding in
    /*setTimeout(() => {
      setBoardStack((prev) =>
        prev.map((b) =>
          b._id === board._id ? {...b, currentX: b.targetX} : b
        )
      );
    }, 400);*/
  };

  // When we click on the up arrow, we want to pop the latest
  // boardcard off the stack
  const goUp = () => {
    setBoardStack(prev => {
      if (prev.length <= 1) {
        navigate("/dashboard");
        return [];
      }

      // Remove the last board
      const trimmed = prev.slice(0, -1);

      // Decrement the layer of each remaining board
      const updated = trimmed.map(board => ({
        ...board,
        layer: board.layer - 1
      }));

      return updated;
    });
  };



  // Define a function named spawnNewBoardCard which will dynamically put in more of them
  // This will spawn a card when the board is opened
const hasSpawnedInitialCard = useRef(false);

/*useEffect(() => {
  if (!hasSpawnedInitialCard.current) {
    spawnBoardCard("Card1", 100);
    hasSpawnedInitialCard.current = true;
  }
}, []);*/


  // useEffect(() => {
  //   console.log("Board stack:", boardStack);
  // }, [boardStack]);


  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;  // Ignore the second StrictMode run
    fetched.current = true;
    fetchBoard();
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch the actual board
      const boardResponse = await fetch(
        `https://rtbbackend-ng6n.onrender.com/api/boards/${boardId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      // Fetch that board's toplevel tasks
      const taskResponse = await fetch(
        `https://rtbbackend-ng6n.onrender.com/api/tasks/board/${boardId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );


      if (boardResponse.ok && taskResponse.ok) {
        const boardData = await boardResponse.json();
        const taskData = await taskResponse.json();
        const formattedData = {
          "title": boardData.board.title,
          "_id": boardData.board._id,
          "tasks": taskData.tasks,
          "layer": 0,
          "offsetY": 0,
          "isRoot": true
        }

        console.log("Board ID: ", boardData.board._id);
        console.log("Board data: ", formattedData.tasks);

        localStorage.setItem("boardId", boardId);
        
        spawnBoardCard(formattedData, 0);
      } else {
        console.error("Failed to fetch board");
        alert("Board not found");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching board:", error);
      alert("Error loading board");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskBoard = async(taskId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://rtbbackend-ng6n.onrender.com/api/tasks/${taskId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const formattedData = {
          "title": data.task.title,
          "_id": data.task._id,
          "tasks": data.task.subtasks,
          "layer": 0,
          "offsetY": 0,
          "isRoot": false
        }
        console.log("TASK ID: ", data.task._id);

        spawnBoardCard(formattedData, 0)
      } else {
        console.error("Failed to fetch task");
        alert("Task list not found");
      }
    } catch (error) {
      console.error("Error fetching board:", error);
      alert("Error loading board");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="board-view">
        <div className="loading-message">Loading board...</div>
      </div>
    );
  }

  if (boardStack.length == 0) {
    return (
      <div className="board-view">
        <div className="error-message">Board not found</div>
      </div>
    );
  }



  return (
    <div className="board-view" style={{backgroundColor: "#282c34"}}>

      {/* This is the navbar at the top of the page*/}
      <div className="board-navbar">        
        <button className="back-button" onClick={handleBackToDashboard}>
          ← Back to Dashboard
        </button>
        <h1 className="board-title">{boardStack[0].title}</h1>
        <div className="board-user-info">
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="board-profile-pic"
            />
          )}
        </div>
      </div>

      {/* This is the actual board stuff */}

      {boardStack.map(board => (
      <BoardCard sx = {{minWidth: 345, transform: `translateX(${-board.layer * 8}px) translateY(${board.layer * 8}px) translateZ(${-board.layer}px)`, opacity: Math.max(0, 1 - board.layer * 0.33), transition: "left 0.5s ease, transform 0.3 ease, opacity 0.3 ease"}}>
        <Box 
          sx={{
            display: 'flex',               // 1. Enable Flexbox
            flexDirection: 'row',          // (Optional but explicit) Arrange children in a row
            alignItems: 'stretch',         // Vertically centers the items (button, text, button)
            gap: 1,                        // Adds spacing between the children (equivalent to theme.spacing(1))
            p: 1,                          // Adds a little padding around the whole group
            border: '1px solid #ccc',    // Just to visualize the container boundaries
            width: "95%"
          }}
        >
            <IconButton variant="outlined" onClick={()=> goUp()}>
              <ArrowUpward sx={{color:"blue"}}/>
            </IconButton>
            <TextField value = {board.title} fullWidth> </TextField>
            {/* <Typography variant="h6" component="h2" sx={{flex: 1, textAlign: "center"}}>Task Name</Typography> */}
            <IconButton variant="outlined" onClick={() => spawnBoardCard("name", 500)}>
              <Check sx = {{color:"black"}}/>
            </IconButton>
        </Box>

        <TaskList boardId={boardId} taskId = {board.isRoot ? boardId : board._id} tasks={board.tasks} onClickSubtask={onClickSubtask} onTaskRefresh={onTaskRefresh} refreshVersion={refreshVersion} isRoot={board.isRoot} />

      </BoardCard>      
    ))}
    </div>
  );
}
