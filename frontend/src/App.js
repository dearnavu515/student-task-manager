import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [search, setSearch] = useState('');

  const API_URL = 'http://localhost:5000/api/tasks';

  // Fetch tasks
  useEffect(() => {
    axios.get(API_URL).then(res => setTasks(res.data));
  }, []);

  // Add new task
  const addTask = async (e) => {
    e.preventDefault();
    const res = await axios.post(API_URL, { title, description, dueDate });
    setTasks([...tasks, res.data]);
    setTitle('');
    setDescription('');
    setDueDate('');
  };

  // Toggle task status
  const toggleStatus = async (task) => {
    const updated = await axios.put(`${API_URL}/${task._id}`, {
      ...task,
      status: task.status === 'Pending' ? 'Completed' : 'Pending'
    });
    setTasks(tasks.map(t => t._id === task._id ? updated.data : t));
  };

  // Delete task
  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setTasks(tasks.filter(t => t._id !== id));
  };

  // Filter tasks based on search input
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.description.toLowerCase().includes(search.toLowerCase())
  );

  // Chart data
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const data = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        label: 'Tasks',
        data: [completedCount, pendingCount],
        backgroundColor: ['#4caf50', '#ff9800']
      }
    ]
  };

  return (
    <div style={{ margin: '50px' }}>
      <h2>Student Task Manager</h2>

      {/* Add Task Form */}
      <form onSubmit={addTask}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        /><br /><br />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        /><br /><br />
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Add Task</button>
      </form>

      {/* Search / Filter Input */}
      <br />
      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: '20px', padding: '5px', width: '300px' }}
      />

      {/* Task List Table */}
      <h3>Task List</h3>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Title</th><th>Description</th><th>Due Date</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map(task => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{task.dueDate}</td>
              <td>{task.status}</td>
              <td>
                <button onClick={() => toggleStatus(task)}>Toggle Status</button>
                <button onClick={() => deleteTask(task._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Chart */}
      <h3>Task Status Chart</h3>
      <Bar data={data} />
    </div>
  );
}

export default App;
