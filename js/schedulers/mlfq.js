/**
 * Multilevel Feedback Queue (MLFQ) Scheduling Algorithm
 * Processes can move between queues based on behavior
 * Typically uses decreasing time quantums for lower priority queues
 */
class MLFQScheduler {
    constructor(config = null) {
        // Default configuration: 3 queues with increasing quantum sizes
        this.config = config || {
            queues: [
                { name: "Queue 0 (Highest)", priority: 0, quantum: 2, algorithm: "RR" },
                { name: "Queue 1 (Medium)", priority: 1, quantum: 4, algorithm: "RR" },
                { name: "Queue 2 (Lowest)", priority: 2, quantum: 8, algorithm: "FCFS" }
            ],
            promotionTime: 20, // Time after which process can be promoted
            agingTime: 15 // Prevent starvation by aging
        };

        this.name = "MLFQ (Multilevel Feedback Queue)";
        this.description = "Adaptive scheduling with queue promotion/demotion based on behavior";
        this.queues = this.config.queues.map(q => ({ ...q, processes: [] }));
    }

    /**
     * Promote process to higher priority queue (lower index)
     */
    promoteProcess(process) {
        if (process.currentQueue > 0) {
            process.currentQueue--;
        }
    }

    /**
     * Demote process to lower priority queue (higher index)
     */
    demoteProcess(process) {
        if (process.currentQueue < this.queues.length - 1) {
            process.currentQueue++;
        }
    }

    /**
     * Check if process should be promoted (aging mechanism)
     */
    shouldPromote(process, currentTime) {
        const waitingTime = currentTime - (process.lastExecutionTime || process.arrivalTime);
        return waitingTime >= this.config.agingTime;
    }

    /**
     * Execute MLFQ scheduling algorithm
     */
    schedule(processes) {
        const processList = processes.map(p => {
            const clone = p.clone();
            clone.currentQueue = 0; // All processes start at highest priority
            clone.timeInCurrentQueue = 0;
            clone.lastExecutionTime = clone.arrivalTime;
            clone.quantumUsedInQueue = 0;
            return clone;
        });

        const timeline = [];
        let currentTime = 0;
        let completed = 0;
        const totalProcesses = processList.length;

        // Sort by arrival time
        processList.sort((a, b) => a.arrivalTime - b.arrivalTime);

        // Initialize queues
        this.queues.forEach(q => q.processes = []);

        let processIndex = 0;
        const maxTime = Math.max(...processList.map(p => p.arrivalTime + p.burstTime)) * 3 + 100;

        while (completed < totalProcesses && currentTime < maxTime) {
            // Add newly arrived processes to highest priority queue (Queue 0)
            while (processIndex < processList.length &&
                   processList[processIndex].arrivalTime <= currentTime) {
                const process = processList[processIndex];
                process.currentQueue = 0;
                this.queues[0].processes.push(process);
                processIndex++;
            }

            // Check for aging - promote processes that have waited too long
            for (let i = 1; i < this.queues.length; i++) {
                const queue = this.queues[i];
                const toPromote = [];

                queue.processes.forEach(process => {
                    if (this.shouldPromote(process, currentTime)) {
                        toPromote.push(process);
                    }
                });

                toPromote.forEach(process => {
                    const idx = queue.processes.indexOf(process);
                    if (idx > -1) {
                        queue.processes.splice(idx, 1);
                        this.promoteProcess(process);
                        this.queues[process.currentQueue].processes.push(process);
                    }
                });
            }

            // Find highest priority non-empty queue
            let selectedQueue = null;
            let selectedQueueIndex = -1;

            for (let i = 0; i < this.queues.length; i++) {
                if (this.queues[i].processes.length > 0) {
                    selectedQueue = this.queues[i];
                    selectedQueueIndex = i;
                    break;
                }
            }

            if (!selectedQueue) {
                // All queues empty - CPU idle
                if (processIndex < processList.length) {
                    const nextArrival = processList[processIndex].arrivalTime;
                    timeline.push({
                        processId: null,
                        start: currentTime,
                        end: nextArrival,
                        isIdle: true
                    });
                    currentTime = nextArrival;
                }
                continue;
            }

            // Get next process from selected queue (FIFO within queue)
            const process = selectedQueue.processes.shift();

            // Record first execution time
            if (process.firstExecutionTime === -1) {
                process.firstExecutionTime = currentTime;
                process.responseTime = currentTime - process.arrivalTime;
            }

            // Determine execution time based on queue algorithm
            let executionTime;
            const isLastQueue = selectedQueueIndex === this.queues.length - 1;

            if (selectedQueue.algorithm === "FCFS" || isLastQueue) {
                // Last queue typically uses FCFS - run to completion
                executionTime = process.remainingTime;
            } else {
                // Use Round Robin with quantum
                executionTime = Math.min(selectedQueue.quantum, process.remainingTime);
            }

            // Execute
            const startTime = currentTime;
            const endTime = currentTime + executionTime;

            process.remainingTime -= executionTime;
            process.lastExecutionTime = endTime;
            currentTime = endTime;

            // Add to timeline
            timeline.push({
                processId: process.id,
                process: process,
                start: startTime,
                end: endTime,
                isIdle: false,
                queue: selectedQueue.name,
                queueIndex: selectedQueueIndex,
                quantum: executionTime
            });

            // Check if completed
            if (process.remainingTime === 0) {
                process.completionTime = currentTime;
                process.turnaroundTime = process.completionTime - process.arrivalTime;
                process.waitingTime = process.turnaroundTime - process.burstTime;
                process.isCompleted = true;
                completed++;
            } else {
                // Process not completed
                if (selectedQueue.algorithm === "FCFS" || isLastQueue) {
                    // FCFS - put back in same queue
                    selectedQueue.processes.push(process);
                } else {
                    // Used full quantum - demote to lower priority queue
                    if (executionTime >= selectedQueue.quantum) {
                        this.demoteProcess(process);
                    }
                    // Add to appropriate queue
                    this.queues[process.currentQueue].processes.push(process);
                }
            }
        }

        return {
            algorithm: this.name,
            timeline: timeline,
            processes: processList,
            metrics: this.calculateMetrics(processList),
            config: this.config
        };
    }

    /**
     * Calculate performance metrics
     */
    calculateMetrics(processes) {
        const completed = processes.filter(p => p.isCompleted);

        if (completed.length === 0) {
            return {
                avgTurnaroundTime: 0,
                avgWaitingTime: 0,
                avgResponseTime: 0,
                totalTime: 0,
                cpuUtilization: 0
            };
        }

        const totalTurnaround = completed.reduce((sum, p) => sum + p.turnaroundTime, 0);
        const totalWaiting = completed.reduce((sum, p) => sum + p.waitingTime, 0);
        const totalResponse = completed.reduce((sum, p) => sum + p.responseTime, 0);
        const totalBurst = completed.reduce((sum, p) => sum + p.burstTime, 0);
        const totalTime = Math.max(...completed.map(p => p.completionTime));

        return {
            avgTurnaroundTime: totalTurnaround / completed.length,
            avgWaitingTime: totalWaiting / completed.length,
            avgResponseTime: totalResponse / completed.length,
            totalTime: totalTime,
            cpuUtilization: (totalBurst / totalTime) * 100,
            throughput: completed.length / totalTime
        };
    }

    /**
     * Get algorithm information
     */
    getInfo() {
        return {
            name: this.name,
            type: "Preemptive with adaptive queue management",
            description: this.description,
            queues: this.config.queues,
            advantages: [
                "Adaptive - responds to process behavior",
                "Prevents starvation through aging",
                "Good for mixed workloads (I/O and CPU bound)",
                "Balances response time and turnaround time",
                "No need to know process characteristics in advance"
            ],
            disadvantages: [
                "Complex to implement and tune",
                "Parameters (quantum, aging) affect performance significantly",
                "Overhead of queue management",
                "Can be difficult to predict behavior"
            ],
            useCase: "General-purpose operating systems with diverse workloads",
            howItWorks: [
                "All processes start in highest priority queue",
                "Processes that use full quantum are demoted",
                "Processes that don't use full quantum stay in same queue",
                "Aging prevents starvation by promoting waiting processes",
                "Lower queues typically have larger quantums or FCFS"
            ],
            notes: [
                `Aging time: ${this.config.agingTime} time units`,
                `Number of queues: ${this.config.queues.length}`,
                "Used in many modern operating systems (e.g., Unix, Linux)"
            ]
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MLFQScheduler;
}
