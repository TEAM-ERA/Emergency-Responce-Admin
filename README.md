# Emergency-Responce-Admin : Web Tool
A web tool that helps emergency unit to receive and respond to emergency cases reported. The tool also aids health authorities to publish health tips and first-aids procedures.
## Usage Guide
**Requirement**
* Download and install **node.js** on your local machine.
* Download and install **Memcached** on your local machine.  
**Setting up the environment**  
Clone  the project to your local machine
Open with favorite editor
Open your terminal and navigate to the project directly
Run the command **npm install** to install all the dependencies needed to run the tool


**Adding firebase to the project**
**Note: The firebase project must the same as the  
Emergency Response Assistance:Mobile App**
Add a web app in your firebase console.
Generate a new private key for you web project. A json file will be downloaded.
Open the json file and move the content to **[config/credentials.json](config/credentials.json)** 

**Running the App**
Run the command node server.js to start the server
