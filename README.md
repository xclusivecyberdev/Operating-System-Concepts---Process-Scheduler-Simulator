# OS Process Scheduling Simulator

A comprehensive educational simulator for operating system process scheduling algorithms with interactive visualizations and performance metrics.

## Features

### Scheduling Algorithms
- **FCFS (First Come First Serve)**: Non-preemptive scheduling based on arrival time
- **SJF (Shortest Job First)**: Non-preemptive scheduling based on burst time
- **Priority Scheduling**: Preemptive and non-preemptive priority-based scheduling
- **Round Robin**: Preemptive time-sliced scheduling with configurable quantum
- **Multilevel Queue**: Multiple queues with different priorities and algorithms
- **Multilevel Feedback Queue**: Dynamic queue promotion/demotion based on behavior

### Visualizations
- **Gantt Chart**: Timeline visualization of process execution
- **Performance Metrics**: Real-time calculation of turnaround time, waiting time, and response time
- **Comparison Analysis**: Side-by-side comparison of different algorithms

### Educational Materials
- Algorithm explanations and use cases
- Trade-off analysis
- Interactive examples
- Best practices and scenarios

## Getting Started

### Running the Simulator

Simply open `index.html` in a modern web browser. No installation or build process required!

```bash
# Using Python's built-in server
python3 -m http.server 8000

# Or using Node.js
npx serve

# Then open http://localhost:8000 in your browser
```

### Usage

1. **Add Processes**: Define processes with arrival time, burst time, and priority
2. **Select Algorithm**: Choose a scheduling algorithm to simulate
3. **Configure Parameters**: Set quantum for Round Robin or queue parameters for multilevel scheduling
4. **Run Simulation**: View the Gantt chart and performance metrics
5. **Compare**: Run multiple algorithms to compare their performance

## Project Structure

```
├── index.html                 # Main application
├── css/
│   └── styles.css            # Application styling
├── js/
│   ├── process.js            # Process class definition
│   ├── schedulers/
│   │   ├── fcfs.js           # First Come First Serve
│   │   ├── sjf.js            # Shortest Job First
│   │   ├── priority.js       # Priority Scheduling
│   │   ├── roundRobin.js     # Round Robin
│   │   ├── multilevelQueue.js # Multilevel Queue
│   │   └── mlfq.js           # Multilevel Feedback Queue
│   ├── metrics.js            # Performance metrics calculator
│   ├── ganttChart.js         # Gantt chart visualization
│   ├── ui.js                 # User interface controller
│   └── main.js               # Application entry point
├── docs/
│   └── educational.md        # Educational materials
└── examples/
    └── scenarios.json        # Example process scenarios
```

## Performance Metrics

The simulator calculates the following metrics for each algorithm:

- **Turnaround Time**: Time from arrival to completion (Completion Time - Arrival Time)
- **Waiting Time**: Time spent waiting in ready queue (Turnaround Time - Burst Time)
- **Response Time**: Time from arrival to first execution (First Execution - Arrival Time)
- **Average Metrics**: System-wide averages for all processes
- **CPU Utilization**: Percentage of time CPU is executing processes

## Algorithm Comparison

| Algorithm | Preemptive | Advantages | Disadvantages |
|-----------|------------|------------|---------------|
| FCFS | No | Simple, no starvation | Poor average waiting time, convoy effect |
| SJF | No | Optimal average waiting time | Requires knowing burst time, starvation |
| Priority | Yes/No | Flexible importance levels | Starvation, priority inversion |
| Round Robin | Yes | Fair, good response time | Context switch overhead |
| Multilevel Queue | Yes | Flexible, supports different process types | Complex, potential starvation |
| MLFQ | Yes | Adaptive, prevents starvation | Complex configuration |

## Educational Use

This simulator is designed for:
- Operating Systems courses
- Self-study and understanding scheduling algorithms
- Comparing algorithm performance under different workloads
- Visualizing scheduling concepts

## Technologies

- Pure HTML5, CSS3, and JavaScript (ES6+)
- No external dependencies
- Runs entirely in the browser

## License

MIT License - Feel free to use for educational purposes

## Contributing

Contributions welcome! Please feel free to submit pull requests or open issues.
