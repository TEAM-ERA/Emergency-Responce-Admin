# Emergency-Responce-Admin : Web Tool
A web tool that helps emergency unit to receive and respond to emergency cases reported. The tool also aids health authorities to publish health tips and first-aids procedures.
## Usage Guide  
**Requirement**
* Download and install **node.js** on your local machine.
* Download and install **Memcached** on your local machine.  
  
**Setting up the environment**  
* Clone  the project to your local machine
* Open with favorite editor
* Open your terminal and navigate to the project directly
* Run the command **npm install** to install all the dependencies needed to run the tool


**Adding firebase to the project**
**Note: The firebase project must the same as the  
Emergency Response Assistance:Mobile App**  
* Add a web app in your firebase console.
* Generate a new private key for you web project. A json file will be downloaded.
* Open the json file and move the content to **[config/credentials.json](config/credentials.json)**  
* Copy and paste your firebase admin init code from your firebase **[server.js](server.js) line 42.**
* Copy and paste your projectid and storage bukets name to **[.env](.env) lines 9 and 10 respectively.**
 * **Note:** Create a storage bucket in your console before you get the name
* Copy your firebase client configuration file and paste it in **[public/firebase-messaging-sw.js](public/firebase-messaging-sw.js) line 4** and **[public/app-assets/js/config.js](public/app-assets/js/config.js) line 2**
* Lastly, get your Google Map API key and paste it in **[view/report.ejs](view/report.ejs) line 462**

**Running the App**
Run the command **node server.js** to start the server
Visit **http://localhost:3000/** in your browser. 
