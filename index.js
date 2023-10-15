import  express   from "express";
import bodyParser from "body-parser";
import moment from "moment";
import mongoose from "mongoose";

const app = express();
const port = 3000;

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const {Schema} = mongoose;
const dailyWork = new Schema({
    title: {
        type: String,
        required: true
    },
    isComplete: {
        type: Boolean,
        require: true
    },
    // date:{
    //     type: date,
    //     require: true
    // }
})
const WorkGoal = new Schema({
    title: {
        type: String,
        required: true
    },
    isComplete: {
        type: Boolean,
        require: true
    },
})

const DailyToDo = mongoose.model('dailyWork', dailyWork); 
const WorkToDo = mongoose.model('WorkGoal', WorkGoal); 

const w1 = new DailyToDo({
    title: "Insert your work",
    isComplete: false
    // date: moment
})

const dailyItem = [w1];

const wt1 = new WorkToDo({
    title: "Insert your work",
    isComplete: false
    // date: moment
})

const workItem = [wt1];

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async(req, res)=>{
    let myNotes = await DailyToDo.find({});
    if(myNotes.length === 0){
        await DailyToDo.insertMany(dailyItem) 
        myNotes = await DailyToDo.find({});
    }
    // console.log(myNotes)
    try {
        res.render("daily.ejs", {moment: moment, data: myNotes});
    } catch (error) {
        console.error("Failed to make request:", error.message);
        res.render("daily.ejs");
    }
});

app.post('/', async (req,res)=>{
    const todo = req.body.newItem;
    if(!todo){
        res.redirect("/")
    }
    else{
        const w1 = new DailyToDo({title: todo, isComplete: false})
        await w1.save();
        res.redirect("/")
    }
});

app.post('/dailyChecked', async (req,res)=>{
    console.log(req.body.checkbox)
    if(req.body.checkbox.length === 2){
        let id = req.body.checkbox[0];
        let id_data = await DailyToDo.find({_id: id}).exec();
        await DailyToDo.updateOne({ _id: id }, { isComplete: id_data[0].isComplete? false: true});
    }else{
        let id = req.body.checkbox;
        await DailyToDo.updateOne({ _id: id }, { isComplete: false});
    }
    res.redirect('/')
})

app.post('/deleteitem', async (req, res)=>{
    const item_id = req.body.delete;
    console.log(item_id)
    await WorkToDo.findByIdAndDelete(item_id)
    console.log("work is done")
    res.redirect('/work')
})

app.get("/work", async (req,res)=> {
    let myNotes = await WorkToDo.find({});
    if(myNotes.length === 0){
        await WorkToDo.insertMany(workItem) 
        myNotes = await WorkToDo.find({});
    }
    try {
        res.render("work.ejs", {moment: moment, data: myNotes});
    } catch (error) {
        console.error("Failed to make request:", error.message);
        res.render("work.ejs");
    }
})

app.post('/work', async (req,res)=>{
    const todo = req.body.newItem;
    if(!todo){
        res.redirect("/work")
    }
    else{
        const w1 = new WorkToDo({title: todo, isComplete: false})
        await w1.save();
        res.redirect("/work")
    }
});

app.post('/workChecked', async (req,res)=>{
    console.log(req.body.checkbox)
    if(req.body.checkbox.length === 2){
        let id = req.body.checkbox[0];
        let id_data = await WorkToDo.find({_id: id}).exec();
        await WorkToDo.updateOne({ _id: id }, { isComplete: id_data[0].isComplete? false: true});
    }else{
        let id = req.body.checkbox;
        await WorkToDo.updateOne({ _id: id }, { isComplete: false});
    }
    res.redirect('/work')
})

app.listen(port, () => {
    console.log(`Server running on port: http://localhost:${port}`);
});