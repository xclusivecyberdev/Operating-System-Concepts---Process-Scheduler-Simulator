# Educational Materials: CPU Scheduling

## Table of Contents
1. [Introduction to CPU Scheduling](#introduction)
2. [Scheduling Criteria](#criteria)
3. [Algorithm Details](#algorithms)
4. [Common Problems](#problems)
5. [Real-World Applications](#applications)
6. [Practice Exercises](#exercises)

## Introduction to CPU Scheduling

CPU scheduling is a fundamental operating system function that determines which process runs on the CPU at any given time. The goal is to:

- Maximize CPU utilization
- Maximize throughput
- Minimize turnaround time
- Minimize waiting time
- Minimize response time
- Ensure fairness

### Why is CPU Scheduling Important?

In a multiprogramming environment, multiple processes compete for CPU time. Without proper scheduling:
- CPU may remain idle while processes wait
- Critical processes may be delayed
- System responsiveness suffers
- Resources are wasted

## Scheduling Criteria

### 1. CPU Utilization
**Definition:** Percentage of time the CPU is executing processes (not idle)

**Goal:** Keep CPU as busy as possible (ideally 40-90% in real systems)

**Formula:** `(Total Execution Time / Total Time) × 100`

### 2. Throughput
**Definition:** Number of processes completed per unit time

**Goal:** Maximize number of completed processes

**Example:** If 5 processes complete in 100 time units, throughput = 0.05 processes/unit

### 3. Turnaround Time
**Definition:** Total time from process arrival to completion

**Formula:** `Completion Time - Arrival Time`

**Goal:** Minimize average turnaround time

### 4. Waiting Time
**Definition:** Total time process spends in ready queue

**Formula:** `Turnaround Time - Burst Time`

**Goal:** Minimize average waiting time

### 5. Response Time
**Definition:** Time from process arrival to first CPU execution

**Formula:** `First Execution Time - Arrival Time`

**Goal:** Minimize for interactive systems

## Algorithm Details

### FCFS (First Come First Serve)

**Mechanism:**
- Non-preemptive
- Processes executed in arrival order
- Simple FIFO queue

**Example:**
```
Processes: P1(AT=0, BT=24), P2(AT=1, BT=3), P3(AT=2, BT=3)

Timeline: |----P1----|P2|P3|
          0         24 27 30

Avg Waiting Time = (0 + 23 + 25) / 3 = 16 time units
```

**When to Use:**
- Batch processing systems
- When process order matters
- When simplicity is paramount

**Avoid When:**
- Interactive systems
- Mix of long and short processes (convoy effect)

### SJF (Shortest Job First)

**Mechanism:**
- Non-preemptive
- Process with shortest burst time executes first
- Provably optimal for minimizing average waiting time

**Example:**
```
Processes: P1(AT=0, BT=6), P2(AT=1, BT=2), P3(AT=2, BT=8), P4(AT=3, BT=3)

Order: P1 → P2 → P4 → P3
Timeline: |---P1---|P2|P4-|-----P3-----|
          0       6  8  11           19

Avg Waiting Time = (0 + 5 + 9 + 6) / 4 = 5 time units
```

**Challenges:**
- Requires knowing burst time in advance
- Can cause starvation of long processes
- Not practical without prediction

### SRTF (Shortest Remaining Time First)

**Mechanism:**
- Preemptive version of SJF
- At each time unit, process with shortest remaining time executes
- Can preempt currently running process

**Example:**
```
Processes: P1(AT=0, BT=7), P2(AT=2, BT=4), P3(AT=4, BT=1), P4(AT=5, BT=4)

Timeline: |P1|P1|P2|P2|P3|P2|P2|P4|P4|P4|P4|P1|P1|P1|P1|P1|
```

**Benefits:**
- Better average waiting time than non-preemptive SJF
- More responsive to new short processes

**Drawbacks:**
- High context switching overhead
- Starvation still possible

### Priority Scheduling

**Mechanism:**
- Each process assigned a priority
- Lower number = higher priority (convention used here)
- Can be preemptive or non-preemptive

**Priority Assignment Factors:**
- Internal: time limits, memory requirements, file usage
- External: importance, payment, department

**Example (Non-Preemptive):**
```
Processes: P1(AT=0, BT=4, Priority=2), P2(AT=1, BT=3, Priority=1),
           P3(AT=2, BT=1, Priority=3), P4(AT=3, BT=5, Priority=0)

Order: P1 → P4 → P2 → P3
```

**Starvation Problem:**
Low priority processes may never execute if high priority processes keep arriving.

**Solution - Aging:**
Gradually increase priority of waiting processes over time.

### Round Robin

**Mechanism:**
- Preemptive with fixed time quantum
- Circular queue of ready processes
- Each process gets quantum time before moving to queue end

**Quantum Selection:**
- Too small: Excessive context switching
- Too large: Degrades to FCFS
- Typical: 10-100 milliseconds in real systems

**Example (Quantum = 4):**
```
Processes: P1(AT=0, BT=10), P2(AT=1, BT=4), P3(AT=2, BT=5)

Timeline: |P1-4|P2-4|P3-4|P1-4|P3-1|P1-2|
          0   4   8  12  16  17  19

Context Switches = 5
```

**Performance Characteristics:**
- Good response time for interactive systems
- Fair CPU allocation
- Higher average turnaround than SJF but better response

### Multilevel Queue

**Mechanism:**
- Multiple separate queues with different priorities
- Processes permanently assigned to one queue
- Each queue can have its own scheduling algorithm

**Common Configuration:**
1. **System Processes** (Priority 0) - Round Robin, Quantum=2
2. **Interactive Processes** (Priority 1) - Round Robin, Quantum=4
3. **Batch Processes** (Priority 2) - FCFS

**Queue Scheduling:**
- Fixed Priority: Higher priority queues always execute first
- Time Slicing: Each queue gets percentage of CPU time

**Use Case:**
Operating systems with distinct process types (foreground vs background)

### Multilevel Feedback Queue (MLFQ)

**Mechanism:**
- Multiple queues like MLQ
- Processes can move between queues
- Typically uses decreasing quantum sizes

**MLFQ Rules (Classic):**
1. New processes enter highest priority queue
2. If process uses entire quantum, demote to lower queue
3. If process yields CPU before quantum, stays in same queue
4. After time S, move all processes to highest queue (aging)

**Example Configuration:**
```
Queue 0: RR with quantum = 8
Queue 1: RR with quantum = 16
Queue 2: FCFS
```

**Behavior:**
- I/O bound processes stay in high priority queues
- CPU bound processes drift to lower priority queues
- Prevents starvation through aging

**Tuning Parameters:**
- Number of queues
- Scheduling algorithm for each queue
- Quantum for each queue
- Promotion/demotion criteria
- Aging time

## Common Problems

### 1. Convoy Effect

**Problem:** Short processes wait for one long process

**Example:**
```
FCFS: Long process arrives first
P1(BT=100), P2(BT=1), P3(BT=1), P4(BT=1)

All short processes wait for P1 to complete
Average Waiting Time = Very High
```

**Solution:** Use SJF or preemptive scheduling

### 2. Starvation

**Problem:** Low priority or long processes never execute

**Occurs In:** SJF, Priority Scheduling

**Example:**
```
Continuous arrival of short/high-priority processes
Long/low-priority process waits indefinitely
```

**Solution:** Aging - gradually increase priority over time

### 3. Priority Inversion

**Problem:** High priority process waits for low priority process

**Scenario:**
1. Low priority process holds resource
2. High priority process needs resource
3. Medium priority processes preempt low priority
4. High priority waits for low priority to release resource

**Solution:** Priority inheritance or priority ceiling protocols

### 4. Context Switch Overhead

**Problem:** Too frequent switching reduces useful work

**Example:**
```
Round Robin with quantum = 1
Context switch time = 0.1

Efficiency = 1 / (1 + 0.1) = 90.9%
10% of CPU time wasted on switching
```

**Solution:** Balance quantum size appropriately

## Real-World Applications

### Linux Completely Fair Scheduler (CFS)

- Virtual runtime tracking
- Red-black tree for process organization
- Priority-based time slicing
- Similar to MLFQ in behavior

### Windows Scheduler

- 32 priority levels (0-31)
- Multilevel feedback queue approach
- Dynamic priority adjustments
- Real-time priority class for critical processes

### Real-Time Operating Systems (RTOS)

- Rate Monotonic Scheduling (RMS)
- Earliest Deadline First (EDF)
- Priority-based preemptive scheduling
- Deterministic response times

### Server Workloads

- **Web Servers:** Round Robin for fairness
- **Database Systems:** Priority for transactions
- **Batch Processing:** FCFS for simplicity

## Practice Exercises

### Exercise 1: FCFS vs SJF

Given processes:
```
P1: AT=0, BT=8
P2: AT=1, BT=4
P3: AT=2, BT=9
P4: AT=3, BT=5
```

Calculate average waiting time for:
a) FCFS
b) SJF

### Exercise 2: Round Robin

Same processes as Exercise 1, quantum = 4

Draw Gantt chart and calculate:
- Average turnaround time
- Number of context switches

### Exercise 3: Priority Scheduling

```
P1: AT=0, BT=4, Priority=3
P2: AT=1, BT=3, Priority=1
P3: AT=2, BT=5, Priority=2
P4: AT=3, BT=2, Priority=1
```

Compare preemptive vs non-preemptive priority scheduling.

### Exercise 4: Algorithm Selection

For each scenario, recommend best algorithm and explain why:

a) Interactive time-sharing system with many users
b) Batch processing system running overnight jobs
c) Real-time system with strict deadlines
d) General-purpose OS with mixed workload
e) Embedded system with limited context switch overhead

### Exercise 5: MLFQ Simulation

Design an MLFQ with 3 queues for these processes:
```
P1: CPU-bound (BT=20)
P2: I/O-bound (BT=2, yields after 1 unit repeatedly)
P3: Interactive (BT=10, yields after 2 units)
```

Configure quantum sizes and show queue movements.

## Summary

**Key Takeaways:**

1. No single algorithm is best for all scenarios
2. Trade-offs exist between metrics (response vs turnaround)
3. Real systems use sophisticated hybrid approaches
4. Context matters: interactive vs batch vs real-time
5. Modern schedulers are adaptive and multi-queue based

**Algorithm Selector:**
- **Need simplicity?** → FCFS
- **Optimize avg waiting time?** → SJF/SRTF
- **Handle priorities?** → Priority Scheduling
- **Fair time-sharing?** → Round Robin
- **Different process types?** → Multilevel Queue
- **General purpose, adaptive?** → MLFQ

## Further Reading

- Operating System Concepts by Silberschein, Galvin, Gagne
- Modern Operating Systems by Andrew Tanenbaum
- Linux Kernel Development by Robert Love
- Research papers on CFS, O(1) scheduler
- Real-Time Systems by Jane Liu
