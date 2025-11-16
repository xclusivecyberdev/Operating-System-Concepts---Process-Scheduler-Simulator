# Quick Usage Guide

## Getting Started in 5 Minutes

### 1. Open the Simulator
Simply open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge).

Or use a local server:
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx serve
```

Then navigate to `http://localhost:8000`

### 2. Add Processes

**Method 1: Manual Entry**
1. Enter Arrival Time (when process arrives)
2. Enter Burst Time (CPU time needed)
3. Enter Priority (0 = highest priority)
4. Click "Add Process"

**Method 2: Load Example**
1. Select an example scenario from dropdown
2. Click "Load Example"

**Method 3: Random Generation**
1. Click "Generate Random"
2. Enter number of processes

### 3. Select Algorithm

Choose from:
- **FCFS** - First Come First Serve (simple, shows convoy effect)
- **SJF** - Shortest Job First (optimal average waiting time)
- **SRTF** - Shortest Remaining Time First (preemptive SJF)
- **Priority (NP)** - Non-Preemptive Priority
- **Priority (P)** - Preemptive Priority
- **Round Robin** - Time-sliced (set quantum value)
- **Multilevel Queue** - Multiple priority queues
- **MLFQ** - Multilevel Feedback Queue (adaptive)

### 4. Configure Parameters

**For Round Robin:**
- Set Time Quantum (default: 4)
- Smaller quantum = better response, more overhead
- Larger quantum = approaches FCFS

### 5. Run Simulation

**Single Algorithm:**
Click "Run Simulation" to see:
- Gantt Chart visualization
- Process execution timeline
- Performance metrics table
- System-wide statistics

**Compare All:**
Click "Compare All Algorithms" to see:
- Side-by-side Gantt charts
- Metrics comparison table
- Best algorithm highlighted for each metric

### 6. Interpret Results

**Gantt Chart:**
- Each colored block = process execution
- Striped blocks = CPU idle time
- Timeline shows time progression
- Hover for details, click for process info

**Metrics Explained:**
- **AT** (Arrival Time): When process arrives
- **BT** (Burst Time): CPU time needed
- **CT** (Completion Time): When process finishes
- **TAT** (Turnaround Time): CT - AT (total time in system)
- **WT** (Waiting Time): TAT - BT (time waiting)
- **RT** (Response Time): First execution - AT

**System Metrics:**
- **Avg Turnaround Time**: Lower is better
- **Avg Waiting Time**: Lower is better
- **Avg Response Time**: Lower is better (critical for interactive)
- **CPU Utilization**: Higher is better (aim for 70-90%)
- **Throughput**: Processes completed per time unit
- **Context Switches**: Lower is better (less overhead)

## Example Scenarios Explained

### Default Example
Basic scenario to get familiar with the interface and algorithms.

### Convoy Effect
Demonstrates FCFS weakness when long process arrives first.
- **Try:** FCFS vs SRTF vs Round Robin
- **Learn:** Why preemptive scheduling helps

### Starvation Demo
Shows how low-priority processes can starve.
- **Try:** Priority (NP) vs MLFQ
- **Learn:** How aging prevents starvation

### Mixed Workload
Balanced scenario good for comparison.
- **Try:** Compare All Algorithms
- **Learn:** No single algorithm is universally best

## Common Use Cases

### For Students
1. **Homework Problems**: Enter given processes, verify calculations
2. **Exam Prep**: Practice with example scenarios
3. **Concept Learning**: Use educational materials tab

### For Instructors
1. **Demonstrations**: Show algorithm behavior in class
2. **Assignments**: Have students analyze different scenarios
3. **Comparisons**: Illustrate trade-offs between algorithms

### For Self-Learning
1. **Start**: Read Educational Materials tab
2. **Practice**: Run example scenarios
3. **Experiment**: Create custom process sets
4. **Compare**: Use comparison feature
5. **Understand**: Analyze why results differ

## Tips and Tricks

### Understanding Algorithm Behavior

**FCFS is best when:**
- Processes arrive in order of burst time
- Simple batch processing
- Minimal overhead needed

**SJF/SRTF is best when:**
- Minimizing average waiting time is critical
- Burst times can be predicted
- Fairness is not primary concern

**Priority is best when:**
- Processes have different importance levels
- Critical processes must execute quickly
- Can tolerate potential starvation

**Round Robin is best when:**
- Fair CPU sharing needed
- Interactive/time-sharing system
- Response time is critical

**MLFQ is best when:**
- General-purpose OS
- Mixed workload (I/O and CPU bound)
- Adaptive behavior desired

### Experimenting

**Test Convoy Effect:**
```
P1: AT=0, BT=24, Priority=1
P2: AT=1, BT=3, Priority=1
P3: AT=2, BT=3, Priority=1
```
Compare FCFS vs SRTF

**Test Starvation:**
```
Many high-priority short processes
One low-priority long process
```
Compare Priority vs MLFQ

**Find Optimal Quantum:**
```
Load balanced scenario
Try RR with quantum: 2, 4, 8, 16
Compare context switches and times
```

## Troubleshooting

**Gantt chart not showing:**
- Ensure processes are added
- Check that simulation was run
- Try refreshing the page

**Unexpected results:**
- Verify process inputs (arrival, burst, priority)
- Check algorithm selection
- Review algorithm behavior in educational materials

**Performance issues:**
- Limit processes to < 20 for smooth visualization
- Use smaller time values
- Reduce quantum for Round Robin

## Advanced Usage

### Custom Scenarios

Create scenarios to demonstrate specific concepts:

**I/O Bound Processes:**
- Many processes with short bursts (1-3 units)
- Shows RR and MLFQ advantages

**CPU Bound Processes:**
- Few processes with long bursts (20+ units)
- Shows FCFS acceptability for batch

**Real-Time Simulation:**
- Varying priorities
- Shows preemptive priority necessity

### Educational Exercises

1. **Predict then Verify**: Before running, predict which algorithm will win
2. **Metric Focus**: Optimize for specific metric (WT, RT, TAT)
3. **Quantum Analysis**: Find optimal RR quantum for scenario
4. **Trade-off Analysis**: Compare best/worst for each metric

## Keyboard Shortcuts

- **Enter**: After typing process values, adds process
- **Tab**: Navigate between input fields

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires JavaScript enabled.

## Getting Help

1. **Educational Materials Tab**: Comprehensive algorithm explanations
2. **Example Scenarios**: Pre-configured demonstrations
3. **README.md**: Technical documentation
4. **docs/educational.md**: Detailed OS concepts

## Next Steps

1. ✅ Load and run example scenarios
2. ✅ Try comparison mode
3. ✅ Read educational materials
4. ✅ Create custom scenarios
5. ✅ Practice calculating metrics manually
6. ✅ Experiment with different parameters

Happy Learning!
