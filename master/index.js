const express = require("express");

const app = express();
const PORT = 5000;
const jobQueue = [];
const allJobs = [];
app.use(express.json());

// health check route
app.get("/", (req, res) => {
    res.send("Jenkins Master is running");
});

let jobId = 1;

app.post("/webhook", (req, res) => {
    const job = {
        id: jobId++,
        repo: req.body.repo || "unknown",
        language: req.body.language || "node",
        status: "queued",
        createdAt: new Date()
    };

    jobQueue.push(job);
    allJobs.push(job);

    console.log("Job added to queue:");
    console.log(job);
    console.log("Current Queue Length:", jobQueue.length);

    res.status(200).json({
        message: "Job added to queue",
        job: job
    });
});

app.get("/jobs", (req, res) => {
    res.json(allJobs);
});

app.post("/job-complete", (req, res) => {
    const { id } = req.body;

    const job = allJobs.find(j => j.id === id);

    if (job) {
        job.status = "completed";
        console.log(`Job ${id} marked completed`);
    }

    res.json({ message: "updated" });
});

app.get("/get-job", (req, res) => {
    const workerLang = req.query.language;

    if (!workerLang) {
        return res.json({ job: null });
    }

    // find first matching job (FIFO for that language)
    const index = jobQueue.findIndex(
        (job) => job.language === workerLang
    );

    if (index === -1) {
        return res.json({ job: null });
    }

    const job = jobQueue.splice(index, 1)[0];
    job.status = "running";

    console.log(`Assigned Job ${job.id} to ${workerLang} worker`);

    res.json({ job });
});

function processJobs() {
    if (jobQueue.length === 0) {
        return;
    }

    const job = jobQueue.shift(); // FIFO

    console.log(`Processing Job ${job.id}`);

    job.status = "running";

    // simulate execution
    setTimeout(() => {
        job.status = "completed";
        console.log(`Job ${job.id} completed`);
    }, 3000);
}


app.listen(PORT, () => {
    console.log(`Master running on port ${PORT}`);
});

setInterval(processJobs, 5000);