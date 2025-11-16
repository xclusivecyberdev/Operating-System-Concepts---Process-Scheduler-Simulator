/**
 * Shortest Job First (SJF) Scheduling Algorithm
 * Non-preemptive and Preemptive (SRTF - Shortest Remaining Time First) variants
 */
class SJFScheduler {
    constructor(preemptive = false) {
        this.preemptive = preemptive;
        this.name = preemptive ? "SRTF (Shortest Remaining Time First)" : "SJF (Shortest Job First)";
        this.description = preemptive
            ? "Preemptive scheduling where process with shortest remaining time is executed"
            : "Non-preemptive scheduling where shortest job is executed first";
    }

    /**
     * Execute SJF/SRTF scheduling algorithm
     */
    schedule(processes) {
        if (this.preemptive) {
            return this.schedulePreemptive(processes);
        } else {
            return this.scheduleNonPreemptive(processes);
        }
    }

    /**
     * Non-preemptive SJF scheduling
     */
    scheduleNonPreemptive(processes) {
        const processList = processes.map(p => p.clone());
        const timeline = [];
        const completed = [];
        let currentTime = 0;

        while (completed.length < processList.length) {
            // Get all processes that have arrived and not completed
            const available = processList.filter(
                p => p.hasArrived(currentTime) && !p.isCompleted
            );

            if (available.length === 0) {
                // No process available, jump to next arrival
                const nextArrival = Math.min(
                    ...processList.filter(p => !p.isCompleted).map(p => p.arrivalTime)
                );
                timeline.push({
                    processId: null,
                    start: currentTime,
                    end: nextArrival,
                    isIdle: true
                });
                currentTime = nextArrival;
                continue;
            }

            // Select process with shortest burst time
            available.sort((a, b) => a.burstTime - b.burstTime);
            const process = available[0];

            // Record start time
            if (process.firstExecutionTime === -1) {
                process.firstExecutionTime = currentTime;
                process.responseTime = currentTime - process.arrivalTime;
            }

            // Execute to completion
            const startTime = currentTime;
            const endTime = currentTime + process.burstTime;

            process.completionTime = endTime;
            process.turnaroundTime = process.completionTime - process.arrivalTime;
            process.waitingTime = process.turnaroundTime - process.burstTime;
            process.isCompleted = true;

            timeline.push({
                processId: process.id,
                process: process,
                start: startTime,
                end: endTime,
                isIdle: false
            });

            completed.push(process);
            currentTime = endTime;
        }

        return {
            algorithm: this.name,
            timeline: timeline,
            processes: processList,
            metrics: this.calculateMetrics(processList)
        };
    }

    /**
     * Preemptive SJF (SRTF) scheduling
     */
    schedulePreemptive(processes) {
        const processList = processes.map(p => p.clone());
        const timeline = [];
        let currentTime = 0;
        let currentProcess = null;
        const maxTime = Math.max(...processList.map(p => p.arrivalTime + p.burstTime)) + 100;

        while (processList.some(p => !p.isCompleted) && currentTime < maxTime) {
            // Get all arrived and incomplete processes
            const available = processList.filter(
                p => p.hasArrived(currentTime) && !p.isCompleted
            );

            if (available.length === 0) {
                // CPU idle
                const nextArrival = Math.min(
                    ...processList.filter(p => !p.isCompleted).map(p => p.arrivalTime)
                );
                if (nextArrival > currentTime) {
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

            // Select process with shortest remaining time
            available.sort((a, b) => a.remainingTime - b.remainingTime);
            const selectedProcess = available[0];

            // Check for context switch
            if (currentProcess !== selectedProcess) {
                currentProcess = selectedProcess;
                if (currentProcess.firstExecutionTime === -1) {
                    currentProcess.firstExecutionTime = currentTime;
                    currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
                }
            }

            // Execute for 1 time unit
            const startTime = currentTime;
            currentProcess.remainingTime -= 1;
            currentTime += 1;

            // Check if process completed
            if (currentProcess.remainingTime === 0) {
                currentProcess.completionTime = currentTime;
                currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
                currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
                currentProcess.isCompleted = true;
            }

            // Merge with previous timeline entry if same process
            if (timeline.length > 0 &&
                timeline[timeline.length - 1].processId === currentProcess.id &&
                !timeline[timeline.length - 1].isIdle) {
                timeline[timeline.length - 1].end = currentTime;
            } else {
                timeline.push({
                    processId: currentProcess.id,
                    process: currentProcess,
                    start: startTime,
                    end: currentTime,
                    isIdle: false
                });
            }
        }

        return {
            algorithm: this.name,
            timeline: timeline,
            processes: processList,
            metrics: this.calculateMetrics(processList)
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
            type: this.preemptive ? "Preemptive" : "Non-preemptive",
            description: this.description,
            advantages: [
                "Optimal average waiting time",
                "Better throughput than FCFS",
                this.preemptive ? "Can handle urgent short processes" : "Simple implementation"
            ],
            disadvantages: [
                "Requires knowing burst time in advance",
                "Starvation of long processes possible",
                "Difficult to predict burst time accurately",
                this.preemptive ? "Higher context switching overhead" : "Not responsive to new short jobs"
            ],
            useCase: this.preemptive
                ? "Time-sharing systems where response time is important"
                : "Batch systems where burst time can be estimated"
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SJFScheduler;
}
