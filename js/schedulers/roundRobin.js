/**
 * Round Robin Scheduling Algorithm
 * Preemptive time-sliced scheduling with configurable quantum
 */
class RoundRobinScheduler {
    constructor(quantum = 4) {
        this.quantum = quantum;
        this.name = `Round Robin (Quantum: ${quantum})`;
        this.description = `Preemptive scheduling with time quantum of ${quantum} units`;
    }

    /**
     * Execute Round Robin scheduling algorithm
     */
    schedule(processes) {
        const processList = processes.map(p => p.clone());
        const timeline = [];
        const readyQueue = [];
        let currentTime = 0;
        let completed = 0;
        const totalProcesses = processList.length;

        // Sort by arrival time initially
        processList.sort((a, b) => a.arrivalTime - b.arrivalTime);

        let processIndex = 0;
        const maxTime = Math.max(...processList.map(p => p.arrivalTime + p.burstTime)) * 2 + 100;

        while (completed < totalProcesses && currentTime < maxTime) {
            // Add newly arrived processes to ready queue
            while (processIndex < processList.length &&
                   processList[processIndex].arrivalTime <= currentTime) {
                readyQueue.push(processList[processIndex]);
                processIndex++;
            }

            if (readyQueue.length === 0) {
                // CPU idle - jump to next arrival
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

            // Get next process from ready queue
            const process = readyQueue.shift();

            // Record first execution time
            if (process.firstExecutionTime === -1) {
                process.firstExecutionTime = currentTime;
                process.responseTime = currentTime - process.arrivalTime;
            }

            // Execute for quantum or remaining time, whichever is smaller
            const executionTime = Math.min(this.quantum, process.remainingTime);
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
                quantum: executionTime
            });

            // Add newly arrived processes before re-queuing current process
            while (processIndex < processList.length &&
                   processList[processIndex].arrivalTime <= currentTime) {
                readyQueue.push(processList[processIndex]);
                processIndex++;
            }

            // Check if process completed
            if (process.remainingTime === 0) {
                process.completionTime = currentTime;
                process.turnaroundTime = process.completionTime - process.arrivalTime;
                process.waitingTime = process.turnaroundTime - process.burstTime;
                process.isCompleted = true;
                completed++;
            } else {
                // Re-add to ready queue if not completed
                readyQueue.push(process);
            }
        }

        return {
            algorithm: this.name,
            timeline: timeline,
            processes: processList,
            metrics: this.calculateMetrics(processList),
            quantum: this.quantum
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
                cpuUtilization: 0,
                contextSwitches: 0
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
            throughput: completed.length / totalTime,
            quantum: this.quantum
        };
    }

    /**
     * Set time quantum
     */
    setQuantum(quantum) {
        this.quantum = quantum;
        this.name = `Round Robin (Quantum: ${quantum})`;
        this.description = `Preemptive scheduling with time quantum of ${quantum} units`;
    }

    /**
     * Get algorithm information
     */
    getInfo() {
        return {
            name: this.name,
            type: "Preemptive",
            description: this.description,
            advantages: [
                "Fair allocation of CPU time",
                "Good response time for interactive systems",
                "No starvation - all processes get CPU time",
                "Simple and easy to implement",
                "Works well for time-sharing systems"
            ],
            disadvantages: [
                "Context switching overhead",
                "Performance depends heavily on quantum size",
                "Average waiting time can be high",
                "Not optimal for processes with varying burst times"
            ],
            useCase: "Time-sharing systems and interactive applications",
            notes: [
                `Current quantum: ${this.quantum} time units`,
                "Small quantum: High context switching, better response time",
                "Large quantum: Approaches FCFS, less overhead",
                "Typical quantum: 10-100 milliseconds in real systems"
            ],
            quantumGuidance: {
                small: "Better for interactive systems (quantum < 10)",
                medium: "Balanced performance (quantum 10-50)",
                large: "Better for batch systems (quantum > 50)"
            }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoundRobinScheduler;
}
