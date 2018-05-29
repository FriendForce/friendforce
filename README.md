# FriendForce  

NOTE: There are incredibly detailed instructions in [my-app/README.md](my-app/README.md)
## Getting started  
`cd my-app`  
To install: `npm install`  
To run server: `npm start`  
## Firebase Setup    
You may need to: `npm install -g firebase-tools` for Google's Firebase cloud functions.  

You may need to: `firebase login`  

### Set up deployment    
run `firebase init`

Select `❯◉ Hosting: Configure and deploy Firebase Hosting sites`  
Enter `my-app/build` for `What do you want to use as your public directory? (public)`  
Select `y` for  `Configure as a single-page app (rewrite all urls to /index.html)? (y/N)`    
Select `N` for `File my-app/build/index.html already exists. Overwrite? (y/N)`  
## Deployment   
If you haven't, do all the pieces of [Firebase Setup](#firebase-setup)  
`npm run build`  
`firebase deploy`  


## Facebook Data Upload Instructions 
1) Download your facebook data. [Instructions Here] (https://www.pcworld.com/article/3265696/software-social/how-to-download-your-facebook-data.html)

2) Click the upload facebook data button and select 
<Your facebook Data folder>
    |-html
        |-friends.htm



