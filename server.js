import express from 'express'
import cors from 'cors';
import mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/ig-noble-prize";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const { Schema } = mongoose;

const prizeSchema = new Schema ({
  id: String,
  Year: Number,
  Subject: String,
  Description: String
});

const Prize = mongoose.model("Prize", prizeSchema);

const port = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());

// Welcome message
app.get('/', (req, res) => {
  res.send('Search IG Noble Prize by year, category or description (free text)')
});

// Full list of Ig Noble Prizes
app.get('/prizes', async (req, res) => {
  try {
    const prizeList = await Prize.find();

    if (prizeList.length > 0) {
      res.status(200).json({
        success: true,
        message: `Found ${prizeList.length} prizes`,
        body: {
          prizelist: prizeList,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No prizes found',
        body: {},
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e,
      body: {},
    });
  }
});

// Get prize by subject // See if possible to return full list if not
app.get('/prizes/subject/:subject', async (req, res) => {
  const { subject } = req.params;

  try {
    const subjectList = await Prize.find({ Subject: subject });

    if (subjectList.length > 0) {
      res.status(200).json({
        success: true,
        message: `Found ${subjectList.length} prizes with subject '${subject}'`,
        body: {
          subjectList: subjectList,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: `No prizes found with subject '${subject}'. Please, make sure to check spelling and use Capital first letter`,
        body: {},
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e,
      body: {},
    });
  }
});

// Get prize by year
app.get('/prizes/year/:year', async (req, res) => {
  const { year } = req.params;

  try {
    const yearList = await Prize.find({ Year: year });

    if (yearList.length > 0) {
      res.status(200).json({
        success: true,
        message: `Found ${yearList.length} prizes from year '${year}'`,
        body: {
          yearList: yearList,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: `No prizes found from year '${year}'. Please, make sure to provide a year between 1991-2022`,
        body: {},
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e,
      body: {},
    });
  }
});

// Prize by Id
app.get("/prizes/id/:id", async (req, res) => {
  const prizeId = req.params.id;

  try {
    // checks if id-input is incorrect! (eg. wrong lenght). Returns error 400 
    if (!mongoose.Types.ObjectId.isValid(prizeId)) {
      return res.status(400).json({
        success: false,
        body: {
          message: 'Invalid ID',
        },
      });
    };
    
    const singlePrize = await Prize.findById(prizeId);
    // If the input is correct but not matched in database, returns 404.
    if (!singlePrize) {
      return res.status(404).json({
        success: false,
        body: {
          message: 'Prize not found',
        },
      });
    }
    // Successful response returns object
    res.status(200).json({
      success: true,
      body: singlePrize,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      body: {
        message: e,
      },
    });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
