# react-epro: simple forms incl VAS scales done in react

This is a small serverless Electronic Patient Reported Outcome (ePRO) react app built on top of the create-react-app (with help from libraries such as material ui, formik, yup, crypto-js) for use with OpenClinica Open Source Electronic Data Capture system (EDC) version 3 (or any other backend upon modification). 

Main purpose of this app is to display, collect, process and save responses to basic online form questionnaires (incl conditional show/hide logic, basic VAS scale). Current css are set-up so that the app will display nicely on tablets.

## Features

* Supports questions with Visual Analogue Scales (VAS) (default 0.0 to 10.0 points scale with colorized emoticons)
* Before the participant is able to fill any questionnaire assigned to him a login of responsible person is required. Afterwards, the participant can be left alone with the tablet on which he is filling the questionnaires without the danger of him modifying anything else. After submiting the finished questionnaire, login of responsible person is required again (and the participant is asked to return the tablet to the responsible person).
* Setup files defining questionnaires, show/hide logic, additional question explanations etc. are prepared in human readable JSON files placed in public folder (file structure explained in /public/visits.json and /public/v1_template.json)

## Requirements
* OpenClinica soap web service is currently used to authenticate the user, check and schedule the events and save the form answers into OpenClinica database.
* Everything incl. password encryption to access soap service and xml processing is done clinet side by the app.
* OpenClinica needs to have the forms present on its side - the forms must be defined and setup in OC in order for the app to save them into the OC database.
* The events and questions definitions as outputed from OpenClinica are used in JSON setup files of this app to properly connect 1:1 between OpenClinica's questions and questions shown and saved from the app into the OpenClinica database. 
* Read the detailed comments inside the src files (the main component /src/Epro.js is heavily commented); (I can't do detailed explanation here in md due to time constraints)

## Currently there are 2 types of questions supported:

### VAS scales

![image](https://user-images.githubusercontent.com/33530732/121013452-21726180-c799-11eb-9936-a15ab36d5371.png)

### Radio buttons (works also as a trigger for show/hide another questions)

![image](https://user-images.githubusercontent.com/33530732/121014111-e4f33580-c799-11eb-8f19-4d31e5c4555b.png)

### If the question is shown, it is then obligatory to answer it:

![image](https://user-images.githubusercontent.com/33530732/121014919-c5104180-c79a-11eb-872a-d31d08cd8777.png)

The information about required answer will be shown upon trying to submit the form while some fields were left unanswered.
