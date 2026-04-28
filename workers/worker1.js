const axios = require("axios");

const MASTER_URL = "http://localhost:5000";

let isBusy = false;

const WORKER_TYPE = "python"; // change per worker

console.log("Worker started...");

async function pollForJobs() {
    if (isBusy) {
        return; // don't pick new job while working
    }

    try {
        const res = await axios.get(`${MASTER_URL}/get-job?language=${WORKER_TYPE}`);
        const job = res.data.job;

        if (!job) {
            console.log("No jobs available...");
            return;
        }

        isBusy = true;

        console.log(`Picked Job ${job.id} (${job.language})`);

        const executionTime = Math.floor(Math.random() * 4000) + 2000;

        setTimeout(async () => {
            await axios.post(`${MASTER_URL}/job-complete`, {
                id: job.id
            });

            console.log(`Completed Job ${job.id}`);
            isBusy = false;
        }, executionTime);

    } catch (err) {
        console.log("Error connecting to master");
    }
}

setInterval(pollForJobs, 3000);