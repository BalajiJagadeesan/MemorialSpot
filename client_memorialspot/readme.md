Installation is based on https://facebook.github.io/react-native/docs/getting-started.html.

Navigate to the link and select tab “Building project with native code”.Please set up your environment based on the OS environment and continue

Clone the file to a local directory

```
git clone https://gitlab.com/highlandpark/MemorialSpot.git
```
Install react-native globally

```
npm install -g react-native-cli
```
Install node modules
```
npm install
(or)
yarn install
```
Checklist before running,

* Make sure you have installed SDK version 27 (project uses 27.0.1 build tool),

* Make sure Java is installed (Built using Java 8)

* Boot a virtual device running Android or connect an android device with USB debugging turned on.

* Make sure adb tools are installed and it is available in the path (this will be available if you have installed android simulator).

* Make sure Gradle is version 3.0+ ( The project is configured to fetch Gradle at build time. Please make sure you have the latest version if you encounter errors relating to Gradle at run-time )

* Make sure port 8081 is free. The build uses JS bundler at this port.

```//To check for windows
netstat -anp | find “8081”
//for Mac
sudo lsof -i :8081 # checks the port 8081
```


To run the project.
```
react native run-android // this will start both JS bundler and build the project at port-8081
```


To run on a different port
```
react-native start —port=”any-number” // This will start JS bundler server
//Open another tab
react-native run-android —port=”number” //same port as above
```

If you have any errors related to building the application, please screenshot the error message. I might able to help you out.

Note: To find the apk file after compiling, please go to the path ./android/app/build/output.
