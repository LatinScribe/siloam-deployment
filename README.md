# Siloam (Real-time On-Demand Image Processing)
​
> _Note:_ This project was proposed and developed by students at the University of Toronto.
> _Note:_ For up to date readme, see the one in the root folder!

## Project Overview

Siloam helps visually impaired individuals gain real-time awareness of their surroundings through audio descriptions. 
The application uses a smartphone’s camera to detect objects and events and converting this information into natural, spoken descriptions.

For instance, users can identify nearby objects such as vehicles, pedestrians, or obstacles, and ask questions like "What is in front of me?" or "Is there a bus stop nearby?"
This app aims to enhance independence and safety, making it easier for users to confidently interact with their environment.

## Key Features
* Ask for description of general surroundings.
* Ask for description of specific object camera is focusing on.
* Lightweight and portable across platforms.
* Friend UI that ergonomic and easy to use.
​ 
## Usage
**Accessing the Application:**
> _Note:_ Registration and login is NOT YET IMPLEMENTED, please ignore this section!
 * Registration: Users are required to register an account upon first use. They can do this by providing a valid email address, username, and secure password.
 * Login: After registration, users can log in using their credentials.
 * Starting the Application: Once logged in, the application opens the camera view by default, ready for real-time object and scene detection.

**Using the Features (Mobile):**
> _Note:_ There is no off the shelf mobile app yet, to try it yourself, you will need to run the project locally. See Developer instructions.
1. General Surroundings Description:
   * Point the camera at your environment.
   * Tap the "Describe Surroundings" button to receive an audio description of the scene.
2. Specific Object Focus:
   * Center the object in the camera view.
   * Tap the "Identify Object" button to get an audio description of the specific object currently being pointed at.
3. Ask Custom Questions:
   * Use the built-in voice command feature by holding the microphone icon.
   * Ask questions like "What’s in front of me?" or "Is there a bus stop nearby?"
  
***Navigation Tips:***
* Ensure the camera lens is clean and unobstructed for better detection accuracy.
* Hold the device steady while capturing surroundings.
* Use headphones for clearer audio output.
* For the best results, try ask specific questions.
* Not satisfied with a response, ask again and prompt it for more details about a specific attribute. 

**Using the Features (Web):**
> _Note:_ because SSL certificate is not configured on the server yet, you will be accessing it with http, not https, so you may recieve a "not safe" warning from your browser. Please ignore that warning and continue.
1. Describe an image (file)
   * Navigate to: http://68.183.202.20:3001/
   * Under "Upload Image File", click "Choose File".
   * Select a image file of your choice (.jpeg, .png).
   * Select a voice which you would like the audio description to use (click/tap on a voice tile).
   * Click/tap the blue "Proccess Image" button. 
   * Wait a few moments, and your image will be described to you (visual and audio)!
   * To replay audio, click/tap "read again".
   * Note: to play the audio with another voice, you must press the "proccess image" button again with the newly selected voice. 
2. Describe an image (url)
   * Navigate to: http://68.183.202.20:3001/
   * Alternatively, you can also use: http://68.183.202.20:3001/process-image
   * Under "Image URL", paste your image URL (link must be publicly accessible).
   * Select a voice which you would like the audio description to use (click/tap on a voice tile).
   * Click/tap the blue "Proccess Image" button. 
   * Wait a few moments, and your image will be described to you (visual and audio)!
   * To replay audio, click/tap "read again".
   * Note: to play the audio with another voice, you must press the "proccess image" button again with the newly selected voice. 
3. Generate your own image URL:
   * If for some reason you want to use a URL instead of directly uploading your image (i.e. TA testing), you can generate your own here.
   * Navigate to: http://68.183.202.20:3001/generate-image-link
   * Under "Upload Image File", click "Choose File".
   * Select a image file of your choice (.jpeg, .png).
   * Click/tap the "Submit" button.
   * You will see on your screen the publicly available URL to your static image (copy it down now), you can then click on the link to directly view it.
 
## Developer Intstructions:

### Interactive Mobile APP:
> _Note:_ The backend must also already be running. To deploy the backend, see "Web APP". By default, it should connect to the backend hosted on our server, so you will not need to deploy the backend locally.

To run the app, first install expo go on your mobile device (It can run on the web as well so downloading it is not required but recommended for a better experience)

Then navigate to the mobile folder, siloam/mobile, and once there run the following:
* npm install
* npx expo start

A QR code should appear, allowing you to scan it with your phone's camera and it will launch itself in the expo go app

Once there, you will be presented with a default screen that is subject to change, click on the camera tab in the bottom right to 
use the camera and take pictures with it to recieve a TTS (text-to-speech) description of it, or to talk with an AI in real time.

### Web APP

* Download the source code (extract it if nesscary).

* Open the project/root folder in linux (Ubuntu is recommended).
* Navigate to /siloam directory (you should see lots of folders, like "components", "mobile", ).

> _Note:_  At this point, you will likely need to remove the /siloam/mobile folder to ensure everything deploys properly (rm -r -d mobile). We had to include this folder to keep everything on one branch. 

* Please verify that your /siloam/.env file looks something like this: (nano or cat it)

* You should install node: https://nodejs.org/en/download
* At this point, you should be able to run "npm help"

First, install dependencies (node modules):

```bash
npm i
```

Now you can build and run the project
```bash
npm run build
npm start
```
> _Note:_ If you have any build errors, try "npm run dev" instead

You should see that the project is now running locally, default is: http://localhost:3000/

Navigate to that link, and voila! You should have a locally deployed version of the web app running!

### Deploy 

#### Web App and backend
- You should deploy this project on some device running Linux (Ubuntu is recommended). This device must be accessible from a public STATIC IP address.
- Follow the same instructions as Developer Instruction - Web App. You will need to modify your .env variable to use your devices ip as the url (or whatever server name you end-up configuring in Nginx, see below)
- We recommend using Nginx for request routing. This is not a Nginx guide. If you are not familiar with Nginx, we will refer you to the following guide: https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04 

#### Mobile app
- 

**Deployment Tools (Suggestions)**

#### DigitalOcean Droplet
- Chosen for its flexibility and reliable hosting for full-stack applications.
- DigitalOcean provides a scalable, cost-effective solution for hosting both backend and frontend services.
- It allows complete control over server configuration, making it ideal for production environments.

***
> _Note:_ The following sections are some extra details, which you can ignore!

 ## Coding Standards and Guidelines
 * Maintain clear and concise documentation for all functions.
 * Write unit tests for critical components to ensure code reliability.
 * For JavaScript, adhere to the Airbnb JavaScript style guide.


 ## Development requirements
 **Operating System:** Any recent browser (Chrome, Firefox, etc), Android & iOS (mobile version)
### Back-end
- **Languages:** JavaScript/TypeScript
- **Frameworks:** 
  - [Next.js](https://nextjs.org/) (preferred)
  - [Express.js](https://expressjs.com/) (alternative option)

### Front-end
- **Frameworks:** [Next.js](https://nextjs.org/) + [React](https://reactjs.org/)
- **Language:** TypeScript, some CSS/HTML
- **Styling:** [TailwindCSS](https://tailwindcss.com/)
- **Note:** Mobile frontend support is planned if time allows.

### Database
- **Database Options:** PostgreSQL or SQLite
- **ORM:** [Prisma](https://www.prisma.io/)

### Image Recognition
- **Processor:** GPT-4 vision processing for advanced image recognition tasks.
- **Frameworks and Tools:**  
  - [Cordova](https://cordova.apache.org/) or [Capacitor](https://capacitorjs.com/) for building cross-platform mobile apps  
  - [TensorFlow.js](https://www.tensorflow.org/js) for object detection  
  - [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for audio descriptions  
  - [Node.js](https://nodejs.org/) and NPM for development
​
## Github Workflow

**Branching Strategy**
- The main branch is `main` (protected branch). Developers create feature branches from `main`. 

**Pull Requests**
- Feature branches are merged into `main` via pull requests.
- Each pull request must be reviewed by at least one team member.

**Code Reviews**
- All pull requests are subject to code reviews to maintain code quality.
- Reviewers check for:
  - Code functionality
  - Style adherence
  - Documentation

**Merge Process**
- Only reviewers with write access can merge pull requests after approval.

## Deployment Process

**Code Development**
- Write and test code locally. Local development server should be built in development mode. 

**Create Pull Request**
- Submit a pull request from the feature branch to `main`.

**Review and Merge**
- After approval, merge the pull request into `main`.


## Getting Started

You should install node: https://nodejs.org/en/download

First, run the development server:

```bash
npm i

npm i prisma

npx prisma generate

npx prisma migrate dev

npm run dev
```

To see data base, run the following:

```bash
npm i # if not already done

npx prisma generate

npx prisma migrate dev

npx prisma studio
```

GENERAL RULES:
- DO NOT EVER PUSH NODE MODULES!!!!!!!
- if you modify prisma schema, remember to run npx prisma migrate dev

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

### Interactive Mockup APP:
To run the interactive mockup, please click on the following file, where you will be able to demo our mockup:
https://www.figma.com/proto/tNsMMCYDSMgA0xa8K3RtkX/CSC301-D1-Figma?node-id=0-1&t=Kuo4mEe6BaJtd463-1 

![image](https://github.com/user-attachments/assets/971644fd-5ce6-4e4a-bd13-cd21c89c96eb)

Here is our figma design:
https://www.figma.com/design/tNsMMCYDSMgA0xa8K3RtkX/CSC301-D1-Figma?node-id=0-1&t=gb8ycX1rVIVuuTe9-0

## Licenses 

 This project is provided under the [Apache Liscense 2.0](http://www.apache.org/licenses/). Specific details can be found in the License file. 

In short, this project is open-source, modifiable, and re-distributable, so long as the original author (Siloam) is cited and any changes properly docuemnted. 
