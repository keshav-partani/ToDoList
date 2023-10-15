import  express   from "express";
import bodyParser from "body-parser";
import moment from "moment";
import mongoose from "mongoose";

const app = express();
const port = 3000;
const mongoURL = "mongodb://127.0.0.1:27017/todolistDB";

// Connection with mongodb localhost
mongoose.connect(mongoURL);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const {Schema} = mongoose;

// Daily Work Schema, Model, Item
const dailyWork = new Schema({
    title: {
        type: String,
        required: true
    },
    isComplete: {
        type: Boolean,
        require: true
    },
    date:{
        type: Date,
        require: true
    }
})
const DailyToDo = mongoose.model('dailyWork', dailyWork); 
const w1 = new DailyToDo({
    title: "New Day New Work",
    isComplete: false,
    date: moment().toDate()
})
const dailyItem = [w1];

// Work Goal Schema, Model, Item
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
const WorkToDo = mongoose.model('WorkGoal', WorkGoal); 
const wt1 = new WorkToDo({
    title: "Insert your work",
    isComplete: false
})
const workItem = [wt1];


// Daily notes routes points like home, new add, complete work or not(check), delete Work,  delete Automatically (if new date comes)

app.get('/', async(req, res)=>{
    let myNotes = await notes();
    if(myNotes.length === 0){
        await DailyToDo.insertMany(dailyItem) 
        myNotes = await notes();
    }
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
        const w1 = new DailyToDo({title: todo, isComplete: false, date: moment().toDate()})
        await w1.save();
        res.redirect("/")
    }
});

app.post('/dailyChecked', async (req,res)=>{
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

async function notes(){
    let myNotes = await DailyToDo.find({});
    for (let index = 0; index < myNotes.length; index++) {
        const element = myNotes[index];
        if(element.date.getDate() === moment().toDate().getDate()){
            //as it is no change
        }else{
            await DailyToDo.findByIdAndDelete(element._id)
        }
    }
    myNotes = await DailyToDo.find({});
    return myNotes
}


app.post('/deleteDailyitem', async (req, res)=>{
    const item_id = req.body.delete;
    await DailyToDo.findByIdAndDelete(item_id)
    res.redirect('/')
})


// Work Goals routes points like home, new add, complete work or not(check), delete Work
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

app.post('/deleteitem', async (req, res)=>{
    const item_id = req.body.delete;
    await WorkToDo.findByIdAndDelete(item_id)
    res.redirect('/work')
})

//port listening

app.listen(port, () => {
    console.log(`Server running on port: http://localhost:${port}`);
});