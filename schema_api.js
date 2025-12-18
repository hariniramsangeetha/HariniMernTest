
/*
# SECTION B: Backend Coding Questions (50 Marks) - 70 Minutes

## Question 1: Create a New Schema & CRUD APIs (15 Marks)

Create a **Category** model and its CRUD APIs.

**Requirements:**
- Schema should have: `name` (String, required, unique), `description` (String), `createdAt` (Date, default: Date.now)
- Create the following APIs:
  1. `POST /categories` - Create a category (3 marks)
  2. `GET /categories` - Get all categories (3 marks)
  3. `GET /categories/:id` - Get single category by ID (3 marks)
  4. `PUT /categories/:id` - Update a category (3 marks)
  5. `DELETE /categories/:id` - Delete a category (3 marks)

**Starter Code:**
```javascript
// Create your schema and model here
let categorySchema = new mongoose.Schema({
    // Define your schema
})

let categoryModel = mongoose.model('categories', categorySchema)

// Create your APIs below
```

---
*/
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const {rateLimit}=require('express-rate-limit')
const express = require("express");
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')

const app = express();
dotenv.config() 
app.use(express.json())
app.use(cors()) 


const port=process.env.PORT
async function connection()//async the function,await the connection
{
    await mongoose.connect(process.env.MONGODB_URL)
     console.log("MongoDB url :"+process.env.MONGODB_URL)
}
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
})

let categorySchema = new mongoose.Schema({
    name: {type: String,required: true,unique: true},
    description: {type: String},
    createdAt: {type: Date,default: Date.now}
});

let categoryModel = mongoose.model("categories", categorySchema);


//POST /categories
app.post('/categories',async (req,res)=>{
    try {

        const {name,description,createdAT}=req.body;
        let isProduct = categoryModel.findOne({title,price,img})
        if(iscategory) return res.json({msg:"The category you are trying to add already exist"})
        let newcategory = {name,description,createdAT}
        await categoryModel.create(newcategory)
        res.status(201).json({msg:"category are added successfully"})

    } catch (error) {
        res.json({msg:error.message})
    }
})


//GET /categories`
app.get('/seecategory',async (req,res)=>{
    try {
        let categorys= await categoryModel.find();
        res.json({categorys})
    } catch (error) {
        res.json({msg:error.message})
        
    }
})

//GET /categories/:id
app.get('/categorys/:categoryId',async (req,res)=>{
   let categoryId = req.params.categoryId
   let category = await categoryModel.findById(categoryId)
   res.json({category})

})

app.put('/updateproduct/:categoryId',async (req,res)=>{
    try {
        const {name,description,createdAt} = req.body
        let cat = categoryModel.findOne({name,description,createdAt})
        await categoryModel.findByIdAndUpdate(cat._id,{name,description,createdAt})
        res.json({msg:"category updated"})
    } catch (error) {
        res.json(error.message)
    }
})

app.delete('/deleteCategory/:',async (req,res)=>{
    try {
        const {name}=req.body//deletebyid//they dont send id,id is created by mongodb by default//they use _id
        let cat = await categoryModel.findOne({name});//assign a document to 'pro' which have the _id 
        await categoryModel.findByIdAndDelete(cat._id)
        res.json({msg:"product is deleted"})

    } catch (error) {
        res.json({msg:error.message})
    }
})

app.post('/signin',async (req,res)=>{//login logic
    try {
    const {username,password} = req.body
    let userdetails = await userModel.findOne({username})
    if(!userdetails) return res.json({msg:"user not found"})
    let checkpassword = await bcrypt.compare(password,userdetails.password)
    if(!checkpassword) return res.json({msg:"invalid credentials/username/password is wrong"})
    let payload = {username:username}
    let token = jwt.sign(payload,secretKey,{expiresIn:"1hr"})
    res.json({msg:"login successful",tokenKey:token})
    } catch (error) {
        res.json({msg:error.message})
        
    }
})

let userSchema = new mongoose.Schema(
    {
        email:{type:String,required:true},
        password:{type:String,required:true},
        username:{type:String,required:true,unique:true}
    })

let userModel = mongoose.model('users',userSchema)

app.post('/forget-password',async(req,res)=>{
        try{
            const {email}=req.body
            let {userdetail}=await usermodel.findOne({email})
            if(!userdetail.email) return res.json({msg:"user not found"})
            const otp= Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
            
            const transporter=nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:process.env.GMAIL_USER,
                    pass:process.env.GMAIL_APP_PASSWORD
                }
            })
            user.otp=otp
            await user.save()
            const format={
            from:process.env.GMAIL_USER,
            to:email,
            subject:'Forget password otp',
            text:'To reset the password ',
            html:`
            <p>Hi ${user.username},</p>
                <p>Your OTP to reset password is <b>${otp}</b></p>
            `

        }
        await transporter.sendMail(mailOptions);

        res.json({ msg: "OTP sent successfully" });


        }
        catch(error){
            res.json({
                msg:error.message
            })
        }
    })
    app.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await usermodel.findOne({ email });
        if (!user) {
            return res.json({ msg: "User not found" });
        }

        if (user.otp !== Number(otp)) {
            return res.json({ msg: "Invalid OTP" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.otp = null; // clear OTP
        await user.save();

        res.json({ msg: "Password reset successful" });

    } catch (error) {
        res.json({ msg: error.message });
    }
});
    app.listen(port,async ()=>
    {
        console.log(`the server is running on ${port}`)
        connection();
        //hashing();
        console.log("secret key :"+process.env.secretKey)
        console.log("Port number:"+ process.env.PORT)
        
    })
