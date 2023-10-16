import  express   from "express";
import bodyParser from "body-parser";
import moment from "moment";
import mongoose from "mongoose";
import lodash from "lodash";

const app = express();
const port = 3000;
const mongoURL = "mongodb://127.0.0.1:27017/toDoList";

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

// new custom schema model
const listSchema = {
    name: String,
    items: [WorkGoal]
}
const ListToDo = mongoose.model("List", listSchema);


//Printing data of all types of routes
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

// To / route
app.get('/', async(req, res)=>{
    let myNotes = await notes();
    if(myNotes.length === 0){
        await DailyToDo.insertMany(dailyItem) 
        myNotes = await notes();
    }
    try {
        res.render("index.ejs", {heading: moment().format('dddd, MMMM D'), data: myNotes});
    } catch (error) {
        console.error("Failed to make request:", error.message);
        res.render("index.ejs");
    }
});

// To /work route
app.get("/work", async (req,res)=> {
    let myNotes = await WorkToDo.find({});
    if(myNotes.length === 0){
        await WorkToDo.insertMany(workItem) 
        myNotes = await WorkToDo.find({});
    }
    try {
        res.render("index.ejs", {heading: "My Goals", data: myNotes});
    } catch (error) {
        console.error("Failed to make request:", error.message);
        res.render("index.ejs");
    }
})


// To custom routes
app.get("/:customListName", async (req,res)=> {
    const customListName = lodash.capitalize(req.params.customListName);

    let foundList = await ListToDo.findOne({name: customListName})
    if(!foundList){
        // console.log("Not exists")
        const list = new ListToDo({
            name: customListName,
            items: workItem,
        });
        list.save();
        foundList = await ListToDo.findOne({name: customListName})
        res.render("index.ejs", {heading: foundList.name, data: foundList.items});
    }else{
        // console.log("Exists")
        res.render("index.ejs", {heading: foundList.name, data: foundList.items});
    }
    
})

// Adding new data to all routes
app.post('/', async (req,res)=>{
    const newItem = req.body.newItem;
    const headingRoute = req.body.list;
    if(headingRoute === moment().format('dddd, MMMM D')){
        const w1 = new DailyToDo({title: newItem, isComplete: false, date: moment().toDate()})
        await w1.save();
        res.redirect("/")
    }
    else if(headingRoute === "My Goals"){
        const w1 = new WorkToDo({title: newItem, isComplete: false})
        await w1.save();
        res.redirect("/work")
    }
    else{
        const listCollection = await ListToDo.findOne({name: headingRoute}).exec();
        const w1 = new WorkToDo({title: newItem, isComplete: false})
        await listCollection.items.push(w1)
        await listCollection.save()
        res.redirect("/" + headingRoute)
    }
});

// Checkbox work
app.post('/checked', async (req,res)=>{
    const itemId = req.body.checkbox
    const heading = req.body.heading
    if(heading === moment().format('dddd, MMMM D')){
        let id_data = await DailyToDo.find({_id: itemId}).exec();
        await DailyToDo.updateOne({ _id: itemId }, { isComplete: id_data[0].isComplete? false: true});
        res.redirect("/")
    }
    else if(heading === "My Goals"){
        let id_data = await WorkToDo.find({_id: itemId}).exec();
        await WorkToDo.updateOne({ _id: itemId }, { isComplete: id_data[0].isComplete? false: true});
        res.redirect("/work")
    }
    else{
        const listCollection = await ListToDo.findOne({name: heading}).exec();
        const updableItem = listCollection.items.find(item => item.id === itemId);
        if(updableItem.isComplete){
            updableItem.isComplete = false;
        }else{
            updableItem.isComplete = true;
        }
        await listCollection.save()
        res.redirect("/" + heading)
    }
})

// Delete a work
app.post('/delete', async (req, res)=>{
    const item_id = req.body.delete;
    const heading = req.body.heading;
    if(heading === moment().format('dddd, MMMM D')){
        await DailyToDo.findByIdAndDelete(item_id)
        res.redirect("/")
    }
    else if(heading === "My Goals"){
        await WorkToDo.findByIdAndDelete(item_id)
        res.redirect("/work")
    }
    else{
        await ListToDo.findOneAndUpdate({name: heading}, {$pull: {items: {_id: item_id}}})
        res.redirect("/" + heading)
    }
})

app.listen(port, () => {
    console.log(`Server running on port: http://localhost:${port}`);
});