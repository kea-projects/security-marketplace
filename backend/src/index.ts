import express from "express";

const app = express();




const PORT = process.env.APP_PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend App is running on port: ${PORT}`);
    
})
