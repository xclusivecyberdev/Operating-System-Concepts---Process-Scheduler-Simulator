/**
 * Multilevel Queue Scheduling Algorithm
 * Multiple queues with different priorities and scheduling algorithms
 * Processes are permanently assigned to queues based on priority
 */
class MultilevelQueueScheduler {
    constructor(config = null) {
        // Default configuration: 3 queues with different algorithms
        this.config = config || {
            queues: [
                { name: "System", priority: 0, algorithm: "RR", quantum: 2 },
                { name: "Interactive", priority: 1, algorithm: "RR", quantum: 4 },
                { name: "Batch", priority: 2, algorithm: "FCFS", quantum: null }
            ],
            assignmentStrategy: "priority" // or "random", "roundrobin"
        };

        this.name = "Multilevel Queue";
        this.description = "Multiple queues with different scheduling algorithms";
        this.queues = this.config.queues.map(q => ({ ...q, processes: [] }));
    }

    /**
     * Assign process to appropriate queue based on priority
     */
    assignToQueue(process) {
        // Assign based on process priority
        // Lower priority number = higher queue priority
        const queueIndex = Math.min(process.priority, this.queues.length - 1);
        process.currentQueue = queueIndex;
        return queueIndex;
    }

    /**
     * Execute scheduling algorithm for a specific queue
     */
    executeQueueAlgorithm(queue, processes, currentTime, quantum) {
        if (processes.length === 0) return null;

        const algorithm = queue.algorithm;

        switch (algorithm) {
            case "RR": // Round Robin
                return this.executeRoundRobin(processes, currentTime, quantum || queue.quantum);

            case "FCFS": // First Come First Serve
                return this.executeFCFS(processes, currentTime);

            case "SJF": // Shortest Job First
                return this.executeSJF(processes, currentTime);

            default:
                return this.executeFCFS(processes, currentTime);
        }
    }

    /**
     * Round Robin for queue
     */
    executeRoundRobin(processes, currentTime, quantum) {
        if (processes.length === 0) return null;
        const process = processes[0]; // Get first process
        const executionTime = Math.min(quantum, process.remainingTime);
        return { process, executionTime, requeue: process.remainingTime > executionTime };
    }

    /**
     * FCFS for queue
     */
    executeFCFS(processes, currentTime) {
        if (processes.length === 0) return null;
        const process = processes[0];
        return { process, executionTime: process.remainingTime, requeue: false };
    }

    /**
     * SJF for queue
     */
    executeSJF(processes, currentTime) {
        if (processes.length === 0) return null;
        // Sort by remaining time
        processes.sort((a, b) => a.remainingTime - b.remainingTime);
        const process = processes[0];
        return { process, executionTime: process.remainingTime, requeue: false };
    }

    /**
     * Execute Multilevel Queue scheduling algorithm
     */
    schedule(processes) {
        const processList = processes.map(p => p.clone());
        const timeline = [];
        let currentTime = 0;
        let completed = 0;
        const totalProcesses = processList.length;

        // Sort by arrival time
        processList.sort((a, b) => a.arrivalTime - b.arrivalTime);

        // Initialize queues
        this.queues.forEach(q => q.processes = []);

        let processIndex = 0;
        const maxTime = Math.max(...processList.map(p => p.arrivalTime + p.burstTime)) * 2 + 100;

        while (completed < totalProcesses && currentTime < maxTime) {
            // Add newly arrived processes to appropriate queues
            while (processIndex < processList.length &&
                   processList[processIndex].arrivalTime <= currentTime) {
                const process = processList[processIndex];
                const queueIndex = this.assignToQueue(process);
                this.queues[queueIndex].processes.push(process);
                processIndex++;
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

            // Execute from selected queue
            const result = this.executeQueueAlgorithm(
                selectedQueue,
                selectedQueue.processes,
                currentTime,
                selectedQueue.quantum
            );

            if (!result) continue;

            const { process, executionTime, requeue } = result;

            // Remove from queue
            const processIdx = selectedQueue.processes.indexOf(process);
            if (processIdx > -1) {
                selectedQueue.processes.splice(processIdx, 1);
            }

            // Record first execution time
            if (process.firstExecutionTime === -1) {
                process.firstExecutionTime = currentTime;
                process.responseTime = currentTime - process.arrivalTime;
            }

            // Execute
            const startTime = currentTime;
            const endTime = currentTime + executionTime;

            process.remainingTime -= executionTime;
            currentTime = endTime;

            // Add to timeline
            timeline.push({
                processId: process.id,
                process: process,
                start: startTime,
                end: endTime,
                isIdle: false,
                queue: selectedQueue.name,
                queueIndex: selectedQueueIndex
            });

            // Check if completed
            if (process.remainingTime === 0) {
                process.completionTime = currentTime;
                process.turnaroundTime = process.completionTime - process.arrivalTime;
                process.waitingTime = process.turnaroundTime - process.burstTime;
                process.isCompleted = true;
                completed++;
            } else if (requeue) {
                // Re-add to same queue if not completed
                selectedQueue.processes.push(process);
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
            type: "Preemptive/Non-preemptive (depends on queue algorithms)",
            description: this.description,
            queues: this.config.queues,
            advantages: [
                "Flexible - different algorithms for different process types",
                "Can prioritize important processes",
                "Suitable for systems with different process classes",
                "Easy to implement different scheduling policies"
            ],
            disadvantages: [
                "Starvation of lower priority queues possible",
                "Complex configuration and tuning",
                "Processes cannot move between queues",
                "May not adapt to changing process behavior"
            ],
            useCase: "Systems with distinct process types (system, interactive, batch)",
            notes: [
                "Processes are permanently assigned to queues",
                "Higher priority queues are served first",
                "Each queue can use a different scheduling algorithm",
                "Common in modern operating systems"
            ]
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultilevelQueueScheduler;
}
