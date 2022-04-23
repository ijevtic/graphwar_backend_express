const express = require('express');

const router = express.Router();
const User = require('../models/User');

router.get('/', async(req,res) => {
    // try {
    //     const posts = await Post.find();
    //     res.json(posts);

    // } catch (err) {
    //     res.status(500).json({message: err.message})
    // }
    res.send("ide gasss");
    // console.log("poy")
    // res.redirect('http://localhost:3000/game')
    // res.render('index_express.ejs', {name: req.user.name})
})

// router.post('/', async (req, res) => {
//     const post = new Post({
//         title: req.body.title,
//         content: req.body.content
//     });
//     try{
//         const savedPost = await post.save();
//         res.json(savedPost);
//     } catch (err) {
//         res.json({message: err});
//     }
//     // res.redirect('/');
// })

// router.get('/:postId', async (req, res) => {
//     try {
//         const post = await Post.findById(req.params.postId);
//         res.json(post);
//     } catch (err) {
//         res.status(500).json({message: err.message});
//     }
// })

module.exports = router;